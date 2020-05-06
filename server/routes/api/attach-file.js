var fs = require('fs');

module.exports = (app) => {
    app.post('/api/attach-file', (req, res, next) => {
        let attatchFile = req.files.attachFile;
        let uploadDir = 'public/uploads/';

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }

        let fileType = attatchFile.name.substring(attatchFile.name.indexOf(".") + 1);
        let newFileName = new Date().getTime();
        attatchFile.mv(`${uploadDir}${newFileName}.${fileType}`, function(err) {
            if (err) {
                return res.status(500).send(err);
            }
            return res.status(200).send({
                status: true,
                fileName: `${newFileName}.${fileType}`
            })
        })
    });
}