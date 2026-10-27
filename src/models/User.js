const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 3
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 6
    },
    displayName: {
        type: String,
        required: true
    },
    profilePicture: {
        type: String,
        default: ''
    }
}, { timestamps: true });


const User = mongoose.model('User', userSchema);
module.exports = User;