const jwt = require('jsonwebtoken');
const randomip = require('random-ip');
const jwt_decode = require("jwt-decode");
const fs = require('fs');
const User = require('../../models/User');
const UserSession = require('../../models/UserSession');

module.exports = (app) => {
    //SignUp
    app.post('/api/account/signup', (req, res, next) => {
        const body = req.body;
        console.log(body);

        const {
            password
        } = body;

        const {
            name
        } = body;

        let {
            email
        } = body;

        if (!email) {
            return res.send({
                success: false,
                message: 'Error: Email cannot be blank.'
            });
        }
        if (!password) {
            return res.send({
                success: false,
                message: 'Error: Password cannot be blank.'
            });
        }

        email = email.toLowerCase();
        email = email.trim();

        User.find({
                email: email,
            },
            (err, prevUsers) => {
                console.log(prevUsers);
                if (err) {
                    return res.status(500).send({
                        message: 'Error: Server Error',
                    });
                } else if (prevUsers.length != 0) {
                    return res.status(200).send({
                        message: 'Error: Account Already Exists'
                    })
                } else {
                    const newUser = new User();

                    newUser.email = email;
                    newUser.password = newUser.generateHash(password);
                    newUser.name = name;
                    console.log(newUser.password);
                    newUser.save((err, user) => {
                        if (err) {
                            return res.status(500).send({
                                message: 'Error: Server Error',
                            });
                        } else {
                            return res.status(200).send({
                                message: "Signed Up",
                            });
                        }

                    });
                }
            });
    });

    app.post('/api/account/signin', (req, res, next) => {
        const { body } = req;

        const {
            password
        } = body;

        let {
            email
        } = body;

        if (!email) {
            return res.status(300).send({
                message: 'Error: Email cannot be blank.',
                respId: 'LIE1'
            });
        }

        if (!password) {
            return res.send({
                success: false,
                message: 'Error Password cannot be blank.',
                respId: 'LIE2',
            });
        }

        email = email.toLowerCase();
        email = email.trim();

        User.find({
            email: email
        }, (err, users) => {
            if (err) {
                console.log('err2:', err);
                return res.send({
                    success: false,
                    message: 'Error: server error',
                    respId: 'LIE3',
                });
            }

            if (users.length != 1) {
                return res.send({
                    success: false,
                    message: 'Error: Invalid',
                    respId: 'LIE4',
                });
            } else {
                const user = users[0];
                console.log(password, user.password);
                if (!user.validPassword(password)) {
                    return res.send({
                        success: false,
                        message: 'Error: Wrong Email or Password',
                        respId: 'LIE5',
                    });
                } else {
                    const userSession = new UserSession();
                    userSession.userId = user._id;
                    userSession.save((err, doc) => {
                        if (err) {
                            console.log(err);
                            return res.send({
                                success: false,
                                message: 'Error: Server Error',
                                respId: 'LIE6',
                            });
                        } else {
                            return res.send({
                                success: true,
                                message: 'Valid sign in',
                                token: doc._id,
                                name: user.name,
                                respId: 'LIS',
                            });
                        }

                    });
                }
            }



        });

    });

    app.get('/api/account/logout', (req, res, next) => {
        const { query } = req;
        const { token } = query;

        UserSession.findOneAndUpdate({
            _id: token,
            isDeleted: false,
        }, {
            $set: {
                isDeleted: true,
            }
        }, null, (err, sessions) => {
            if (err) {
                console.log(err);
                return res.send({
                    success: false,
                    message: 'Error: Server Error',
                });
            } else {
                return res.send({
                    success: true,
                    message: 'Logged Out',
                });
            }
        });

    });

    app.get('/api/account/verify', (req, res, next) => {
        // Get the token
        const { query } = req;
        const { token } = query;
        // ?token=test
        // Verify the token is one of a kind and it's not deleted.
        UserSession.find({
            _id: token,
            isDeleted: false
        }, (err, sessions) => {
            if (err) {
                console.log(err);
                return res.send({
                    success: false,
                    message: 'Error: Server error'
                });
            }
            if (sessions.length != 1) {
                return res.send({
                    success: false,
                    message: 'Error: Invalid'
                });
            } else {
                // DO ACTION
                return res.send({
                    success: true,
                    message: 'Good'
                });
            }
        });
    });

    app.post('/api/guest/signin', (req, res, next) => {
        // Get the client's IP Address
        var ip_address = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        ip_address = ip_address.substr(ip_address.lastIndexOf(":") + 1);

        // var ip_address = randomip('192.168.2.0', 24);

        const { userName, age, gender, location } = req.body;

        User.find({
                ip_address: ip_address,
            },
            (err, prevUsers) => {
                if (err) {
                    return res.status(500).send({
                        status: false,
                        message: 'Error: Server Error',
                    });
                }
                // When user already exist with same ip address
                else if (prevUsers.length != 0) {
                    // Find user with specified ip address and update user's information
                    User.findOneAndUpdate({
                        ip_address: ip_address
                    }, {
                        $set: {
                            userName: userName,
                            age: age,
                            gender: gender,
                            location: location,
                            ip_address: ip_address,
                        }
                    }, {
                        new: true
                    }, (err, user) => {
                        if (err) {
                            console.log(err);
                            return res.status(500).send({
                                status: false,
                                message: 'Error: Server Error',
                            })
                        } else {
                            console.log(user);
                            let token = jwt.sign({ user: user },
                                'secret', {
                                    expiresIn: 31556926 // 1 year in second 
                                },
                                (err, token) => {
                                    if (err) {
                                        console.log('Failed to create token', err);
                                    } else {
                                        return res.status(200).send({
                                            status: true,
                                            message: "SignIn success but user information changed a little",
                                            token: token
                                        });
                                    }
                                }
                            )
                        }
                    });

                }
                // Create new user with client's ip address
                else {
                    const newUser = new User();

                    newUser.userName = userName;
                    newUser.age = age;
                    newUser.gender = gender;
                    newUser.location = location;
                    newUser.ip_address = ip_address;

                    newUser.save((err, user) => {
                        if (err) {
                            return res.status(500).send({
                                message: 'Error: Server Error',
                            });
                        } else {
                            // File copy as default png file according to gender(Male or Female)
                            if (user.gender == "Male") {
                                fs.copyFile('public/profile/male.png', `public/profile/${user.id}.png`, (err) => {
                                    if (err) throw err;
                                });
                            } else if (user.gender == "Female") {
                                fs.copyFile('public/profile/female.png', `public/profile/${user.id}.png`, (err) => {
                                    if (err) throw err;
                                });
                            }


                            User.findOneAndUpdate({
                                _id: user.id
                            }, {
                                $set: {
                                    profile_image: `${user.id}.png`
                                }
                            }, {
                                new: true
                            }, (err, newUser) => {
                                let token = jwt.sign({ user: newUser },
                                    'secret', {
                                        expiresIn: 31556926 // 1 year in second 
                                    },
                                    (err, token) => {
                                        if (err) {
                                            console.log('Failed to create token', err);
                                        } else {
                                            console.log(token);
                                            return res.status(200).send({
                                                status: true,
                                                message: "SignIn success",
                                                token: token
                                            });
                                        }
                                    }
                                )
                            });
                        }
                    });
                }
            }
        )

    });

    app.post('/api/guest/verify', (req, res, next) => {
        var decoded_token = jwt_decode(req.body.token);

        User.find({
                _id: decoded_token.user._id,
            },
            (err, user) => {
                if (user[0].isDeleted == false) {
                    return res.send({
                        status: true
                    });
                }
                return res.send({
                    status: false
                });
            });

    });

    app.post('/api/guest/ipverify', (req, res, next) => {
        var ip_address = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        ip_address = ip_address.substr(ip_address.lastIndexOf(":") + 1);
        User.find({
                ip_address: ip_address
            },
            (err, user) => {
                if (user.length != 0) {
                    if (user[0].isDeleted == false) {
                        console.log("user's information", user[0]);
                        return res.send({
                            status: true
                        });
                    }
                    return res.send({
                        status: false
                    });
                } else {
                    return res.send({
                        status: true,
                        message: 'Not match'
                    });
                }

            });

    });


};