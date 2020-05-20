const User = require('../../models/User');

module.exports = (app) => {
    app.post('/api/admin/manage', (req, res, next) => {
        User.find({ role: { $ne: 'admin' } },
            function(err, users) {
                if (err) {
                    console.log(err);
                    throw err;
                } else {
                    return res.send({
                        success: true,
                        users: users
                    });
                }
            })
    });

    app.post('/api/admin/enable-user', (req, res, next) => {
        User.findOneAndUpdate({
            _id: req.body.user._id,
        }, {
            $set: {
                isDeleted: !req.body.user.isDeleted,
                report_number: req.body.user.isDeleted ? 0 : 5,
                report_reason: ''
            }
        }, { new: true }, (err, newUser) => {
            if (err) {
                return res.send({
                    success: false,
                    message: 'Error: Server Error '
                })
            }
            return res.send({
                success: true,
                user: newUser,
                message: 'User information updated successfully.'
            })
        });
    });
}