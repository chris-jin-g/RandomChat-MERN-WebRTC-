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
        console.log("new room create")
        client.join(e._id);
        console.log(e._id);
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
            console.log("Set user online and connected user with other.")
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
        // var query = {};
        // query.location = e.searchSetting.location;
        // query.gender = e.searchSetting.gender;
        // query.age = { $gte: e.searchSetting.ageMin };
        // query.age = { $lte: e.searchSetting.ageMax };
        // console.log("This is query for mongoose find", query)

        // console.log("this is query gender", gender);
        // { location: e.searchSetting.location, gender: e.searchSetting.gender }


        User.findOneAndUpdate({
            _id: prevTargetUser._id
        }, {
            $set: {
                connected_other: false,
            }
        }, {
            new: true
        }, function() {
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
                    console.log(docs[0]);
                    if (docs.length == 1) {
                        // Send message that there is none to find
                        client.emit('search-none');
                    } else {
                        // Remove users who contacted before
                        var available_user = [];

                        // docs.forEach(function(doc) {
                        //     let blackNum = 0;
                        //     blackUsersList.forEach(function(entry) {
                        //         if (doc._id == entry) {
                        //             blackNum = 1;
                        //             // break;
                        //             // available_user.push(doc);
                        //             // console.log("avai@@@@@", available_user);
                        //         }
                        //     });
                        //     if (blackNum == 0) {
                        //         available_user.push(doc);
                        //     }
                        // });
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
                        // console.log(blackUsersList);
                        if (available_user.length != 0) {
                            let targetUser = available_user[Math.floor(Math.random() * available_user.length)];
                            console.log("signed In User information", signedInUser);
                            console.log("user vs target", signedInUser._id, targetUser._id);
                            // @@@@ Emit to ignored user.

                            // Set previous target user to inactive

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
                                    console.log("update part");
                                    client.emit('find_target', targetUser);
                                    client.to(targetUser._id).emit('find_target', signedInUser);
                                    target_id = targetUser._id;
                                });

                        } else {
                            client.emit('available-none');
                        }

                    }
                } else {
                    throw err;
                }
            });
    });

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
        let sourceId = client.user_id;
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
            });
            // BroadCast socket for logout and disconnect
        });
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
            });
            // BroadCast socket for logout and disconnect
        });
    });

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