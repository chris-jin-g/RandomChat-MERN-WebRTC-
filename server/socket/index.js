const io = require('socket.io');
const User = require('../models/User');

/**
 * Initialize when a connection is made
 * @param {SocketIO.Socket} socket
 */

function initSocket(client) {
    let id;
    let target_id;
    client.on("create_room", e => {
        id = e._id;
        client.join(e._id);

        User.findOneAndUpdate({
            ip_address: e.ip_address
        }, {
            $set: {
                online: true,
                connected_other: false,
            }
        }, {
            new: true
        }, function() {
            client.broadcast.to(e._id).emit('remove_old_session');
        });
    });

    // Find target user with blackUsers list and filter settings
    client.on("find_target", e => {
        var blackUsersList = e.blackUsersList;
        var signedInUser = e.signedInUser;
        var prevTargetUser = e.prevTargetUser;

        if (e.searchSetting.location == '') {
            var location = {};
        } else {
            var location = { location: e.searchSetting.location };
        }

        if (e.searchSetting.gender == '') {
            var gender = {};
        } else {
            var gender = { gender: e.searchSetting.gender };
        }
        ageMin = { age: { $gte: e.searchSetting.ageMin } };
        ageMax = { age: { $lte: e.searchSetting.ageMax } };

        let online = { online: true };
        let isDeleted = { isDeleted: false };
        let connected_other = { connected_other: false };

        User
            .find({
                $or: [
                    { _id: signedInUser._id },
                    { _id: prevTargetUser._id }
                ]
            }).updateMany({
                $set: {
                    connected_other: false,
                }
            }, (err, user) => {
                client.to(prevTargetUser._id).emit('ignore', { status: 'ignore' });
            });

        User.find({
                $and: [
                    location,
                    gender,
                    ageMin,
                    ageMax,
                    online,
                    isDeleted,
                    connected_other
                ]
            },
            function(err, docs) {
                if (!err) {
                    console.log("Filtered user's number:", docs.length);

                    if (docs.length == 0) {
                        // Send message that there is none to find
                        client.emit('search-none');
                    } else {
                        if (docs.length == 1 && docs[0]._id == signedInUser._id) {
                            client.emit('search-none');
                        } else {
                            var available_user = [];

                            console.log("Black user list length", blackUsersList.length, blackUsersList);
                            for (let i = 0; i < docs.length; i++) {
                                let blackNum = 0;
                                for (let j = 0; j < blackUsersList.length; j++) {
                                    if (docs[i]._id == blackUsersList[j])
                                        blackNum = 1;
                                }
                                if (blackNum == 0) {
                                    available_user.push(docs[i]);

                                }
                            }

                            console.log("available user Number", available_user.length);
                            if (available_user.length != 0) {
                                let targetUser = available_user[Math.floor(Math.random() * available_user.length)];

                                User
                                    .find({
                                        $or: [
                                            { _id: signedInUser._id },
                                            { _id: targetUser._id }
                                        ]
                                    }).updateMany({
                                        $set: {
                                            connected_other: true,
                                        }
                                    }, (err, user) => {
                                        client.emit('find_target', targetUser);
                                        client.to(targetUser._id).emit('find_target', signedInUser);
                                    });

                            } else {
                                client.emit('available-none');
                            }
                        }
                        // Remove users who contacted before


                    }
                } else {
                    throw err;
                }
            });
    });

    // Set target user for global variable in backend
    client.on("confirm-find_target", e => {
        target_id = e._id;
    });

    // Let target user know about typing now
    client.on("on-typing", e => {
        client.to(e._id).emit('on-typing');
    });

    client.on("sign-in", e => {
        let user_id = e.id;
        if (!user_id) return;
        client.user_id = user_id;
        if (clients[user_id]) {
            clients[user_id].push(client);
        } else {
            clients[user_id] = [client];
        }
    });

    client.on("message", e => {
        let targetId = e.to;
        // let sourceId = client.user_id;
        // client.to(sourceId).emit('message', e);
        client.emit('message', e);
        client.to(targetId).emit('message', e);
        // if (targetId && clients[targetId]) {
        //     clients[targetId].forEach(cli => {
        //         cli.emit("message", e);
        //     });
        // }

        // if (sourceId && clients[sourceId]) {
        //     clients[sourceId].forEach(cli => {
        //         cli.emit("message", e);
        //     });
        // }
    });

    client.on("confirm_remove_old_session", e => {

        client.leave(e._id);

        User.findOneAndUpdate({
            _id: target_id
        }, {
            $set: {
                connected_other: false,
            }
        }, {
            new: true
        }, function() {
            client.to(target_id).emit('target-logout');
        });
    });

    client.on("log-out", e => {
        User.findOneAndUpdate({
            _id: id
        }, {
            $set: {
                online: false,
                connected_other: false,
            }
        }, {
            new: true
        }, function() {
            User.findOneAndUpdate({
                _id: target_id
            }, {
                $set: {
                    connected_other: false,
                }
            }, {
                new: true
            }, function() {
                client.emit('log-out', e);
                client.to(target_id).emit('target-logout');
                target_id = '';
            });
            // BroadCast socket for logout and disconnect
        });
    });

    client.on("confirm-target-logout", () => {
        target_id = '';
    });

    client.on('disconnect', e => {
        User.findOneAndUpdate({
            _id: id
        }, {
            $set: {
                online: false,
                connected_other: false,
            }
        }, {
            new: true
        }, function() {
            User.findOneAndUpdate({
                _id: target_id
            }, {
                $set: {
                    connected_other: false,
                }
            }, {
                new: true
            }, function() {
                client.to(target_id).emit('target-disconnect');
                target_id = '';
            });
        });
    });

    client.on("confirm-target-disconnect", () => {
        target_id = '';
    })

    // client.on("disconnect", function() {
    //     if (!client.user_id || !clients[client.user_id]) {
    //         return;
    //     }
    //     let targetClients = clients[client.user_id];
    //     for (let i = 0; i < targetClients.length; ++i) {
    //         if (targetClients[i] == client) {
    //             targetClients.splice(i, 1);
    //         }
    //     }
    // });

    // Socket for video chat

    // client.on('init', async() => {
    //     id = await users.create(socket);
    //     client.emit('init', { id });
    // });
    client.on('request', (data) => {
        // const receiver = users.get(data.to);
        // if (receiver) {
        //     receiver.emit('request', { from: id });
        // }
        client.to(data.to).emit('request', { from: id });
    });
    client.on('call', (data) => {
        // const receiver = users.get(data.to);
        // if (receiver) {
        //     receiver.emit('call', {...data, from: id });
        // } else {
        //     socket.emit('failed');
        // }
        client.to(data.to).emit('call', {...data, from: id });
    })
    client.on('end', (data) => {
        // const receiver = users.get(data.to);
        // if (receiver) {
        //     receiver.emit('end');
        // }
        client.to(data.to).emit('end');
    })
    client.on('disconnect', () => {
        // users.remove(id);
        console.log(id, 'disconnected');
    });
}

module.exports = (client) => {
    io({ serveClient: false })
        .listen(client, { log: true })
        .on('connection', initSocket);
};