const express = require('express');
const fs = require('fs');

const mongoose = require('mongoose');
const path = require('path');


const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const cors = require('cors');

const config = require('./config/config');
const port = config.RESTAPIport;
const socket = require('./socket')


// Configuration
// ================================================================================================

// Set up Mongoose
mongoose.connect(config.db, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;

const app = express();
const server = require("http").Server(app);

// const io = require("socket.io")(server);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(logger('dev'));
app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(fileUpload());
app.use('/public', express.static('public'));

app.use('/', express.static(path.resolve(__dirname, '../build')));

app.get('*', function(req, res) {
    res.sendFile(path.resolve(__dirname, '../build/index.html'));
    res.end();
});

// API routes
require('./routes')(app);




server.listen(process.env.PORT || 5000, (err) => {
    if (err) {
        console.log(err);
    }
    socket(server);
    // eslint-disable-next-line no-console
    console.info('Open http://localhost:%s/ in your browser.', process.env.PORT || 5000);
});



module.exports = app;