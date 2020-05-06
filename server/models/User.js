const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    userName: {
        type: String,
        default: '',
    },
    age: {
        type: Number,
        default: '',
    },
    location: {
        type: String,
        default: '',
    },
    gender: {
        type: String,
        default: '',
    },
    profile_image: {
        type: String,
        default: '',
    },
    ip_address: {
        type: String,
        default: '',
    },
    report_number: {
        type: Number,
        default: '',
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    online: {
        type: Boolean,
        default: false,
    },
    connected_other: {
        type: Boolean,
        default: false,
    },
    email: {
        type: String,
        default: '',
    },
    password: {
        type: String,
        default: '',
    },

});

UserSchema.methods.generateHash = (password) =>
    bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);

UserSchema.methods.validPassword = function(password) {
    console.log(this.password);
    return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);