var fs = require('fs');
const User = require('../../models/User');

module.exports = (app) => {
    app.post('/api/report', (req, res, next) => {
        console.log("report user start");
        User.find({
                _id: req.body.targetUser._id
            },
            (err, prevUser) => {
                if (err) {
                    return res.status(500).send({
                        status: false,
                        message: 'Error: Server Error',
                    });
                } else {
                    let reporterList = prevUser[0].report_reason;
                    let already_report = 0;
                    for (let i = 0; i < reporterList.length; i++) {
                        // Check to report already for this signed in user
                        if (reporterList[i].reporter_id == req.body.reportUser._id) {
                            already_report++;
                        }
                    }

                    if (already_report > 0) {
                        console.log("you have already report this user");
                        return res.status(200).send({
                            status: false,
                            message: "You have already reported this user before."
                        });
                    } else {
                        reporterList.push({ reporter_id: req.body.reportUser._id, reason: req.body.reason });
                        console.log("this is report user list", reporterList);
                        let report_number = prevUser[0].report_number;
                        User.findOneAndUpdate({
                            _id: req.body.targetUser._id
                        }, {
                            $set: {
                                report_number: Number(prevUser[0].report_number) + 1,
                                report_reason: reporterList,
                                isDeleted: report_number == 4 ? true : false
                            }
                        }, {
                            new: true
                        }, (err, user) => {
                            if (err) {
                                console.log(err);
                                return res.status(500).send({
                                    status: false,
                                    message: 'Errir: Server Error',
                                })
                            } else {
                                // console.log("this is new user", user);
                                return res.status(200).send({
                                    status: true,
                                    message: "You reported successfully"
                                });
                            }
                        })
                    }

                }
            }
        )
    });
}