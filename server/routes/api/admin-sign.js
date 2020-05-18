const User = require('../../models/User');

module.exports = (app) => {
    app.post('/api/admin/signin', (req, res, next) => {

        let body = req.body;
        let { email, password } = body;
        email = email.toLowerCase();
        email = email.trim();

        User.find({
            email: email
        }, (err, users) => {
            if (err) {
                return res.send({
                    success: false,
                    message: 'Error: server error'
                });
            }

            if (users.length != 1) {
                return res.send({
                    success: false,
                    message: 'Error: This user does not exist.'
                });
            } else {
                const user = users[0];
                console.log(password, user.password);
                if (!user.validPassword(password)) {
                    return res.send({
                        success: false,
                        message: 'Error: Wrong Email or Password'
                    });
                } else {
                    return res.send({
                        success: true,
                        message: 'Valid sign in'
                    });
                }
            }
        });

    });

    app.post('/api/admin/update-profile', (req, res, next) => {
        let body = req.body;
        let { email, password, confirmPassword } = body;
        email = email.toLowerCase();
        email = email.trim();

        if (password != confirmPassword) {
            return res.send({
                success: false,
                message: 'Error: Password and confirm password does not match '
            })
        }

        const newUser = new User();
        const hashPassword = newUser.generateHash(password);

        User.findOneAndUpdate({
            role: 'admin'
        }, {
            $set: {
                email: email,
                password: hashPassword
            }
        }, { new: true }, (err, newUser) => {
            if (err) {
                console.log(err);
                return res.send({
                    success: false,
                    message: 'Error: Server Error',
                });
            } else {
                return res.send({
                    success: true,
                    message: 'Admin information updated successfully',
                });
            }
        });

    });

    app.post('/api/admin/get-info', (req, res, next) => {

        User.find({
            role: 'admin'
        }, (err, user) => {
            if (err) {
                console.log(err);
                throw err;
            } else {
                return res.send({
                    success: true,
                    admin: user[0]
                })
            }
        })
    });
}