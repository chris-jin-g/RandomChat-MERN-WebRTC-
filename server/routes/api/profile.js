const jwt = require('jsonwebtoken');
var fs = require('fs');
const User = require('../../models/User');

module.exports = (app) => {
    app.post('/api/profile/image', (req, res, next) => {

        let profileImage = req.files.file;
        let uploadDir = 'public/profile/';

        let prevFileFullName = req.body.fileName;
        let prevFileName = prevFileFullName.substring(0, prevFileFullName.indexOf("."));
        let prevFileType = prevFileFullName.substring(prevFileFullName.indexOf(".") + 1);

        // Create directory for upload file when profile directory doesn't exist in public directory
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        // Delete prev file.
        if (fs.existsSync(`${uploadDir}${prevFileFullName}`)) {
            fs.unlink(`${uploadDir}${prevFileFullName}`, function() {
                // Get the file type of uploaded file.
                let fileType = profileImage.name.substring(profileImage.name.indexOf(".") + 1);

                profileImage.mv(`${uploadDir}${prevFileName}.${fileType}`, function(err) {
                    if (err) {
                        return res.status(500).send(err);
                    }
                    // When profile image's filetype changed, then should change token information
                    User.findOneAndUpdate({
                        _id: prevFileName
                    }, {
                        $set: {
                            profile_image: `${prevFileName}.${fileType}`
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
                                    return res.status(200).send({
                                        status: true,
                                        message: "Updated profile image successfully",
                                        token: token
                                    });
                                }
                            }
                        )
                    });
                    // res.json({ file: `${uploadDir}${prevFileName}.${fileType}` });
                });

            });
        } else {
            console.log("File does not exist")
        }

    });

    app.post('/api/profile/update', (req, res, next) => {
        if (req.body.age > 99 || req.body.age < 13) {
            return res.status(500).send({
                status: false,
                message: 'Validation Error: Specified attribute is not between the expected ages of 13 and 99.',
            });
        }
        // When profile image's filetype changed, then should change token information
        User.findOneAndUpdate({
            _id: req.body._id
        }, {
            $set: {
                userName: req.body.userName,
                gender: req.body.gender,
                age: req.body.age,
                location: req.body.location
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
                        return res.status(500).send({
                            status: false,
                            message: 'Error: Server error.',
                        });
                    } else {
                        return res.status(200).send({
                            status: true,
                            message: "Updated profile successfully",
                            token: token
                        });
                    }
                }
            )
        });


    });
};