const jwt = require('jsonwebtoken');
var fs = require('fs');
const User = require('../../models/User');

module.exports = (app) => {
    app.post('/api/profile', (req, res, next) => {

        let profileImage = req.files.file;
        let uploadDir = 'public/profile/';

        let prevFileFullName = req.body.fileName;
        let prevFileName = prevFileFullName.substring(0, prevFileFullName.indexOf("."));
        let prevFileType = prevFileFullName.substring(prevFileFullName.indexOf(".") + 1);

        console.log(`${uploadDir}${prevFileFullName}`);

        // Create directory for upload file when profile directory doesn't exist in public directory
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        // Delete prev file.
        if (fs.existsSync(`${uploadDir}${prevFileFullName}`)) {
            fs.unlink(`${uploadDir}${prevFileFullName}`, function() {
                console.log("File deleted successsfully");
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
                                    console.log(token);
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

    })
};