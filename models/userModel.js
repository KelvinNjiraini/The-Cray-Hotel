const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require('validator');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A user must have a username']
    },
    email: {
        type: String,
        required: [true, 'A user must have an email'],
        lowercase: true,
        unique: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            validator: function (el) {
                return el === this.password;
            },
            message: 'Passwords are not the same'
        }
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'custodian'],
        default: 'user'
    },
    active: {
        type: Boolean,
        default: true,
        select: false
    },
}, {
    virtuals: {
        toJSON: true,
        toObject: true
    }
});

userSchema.pre('save', async function () {
    if (!this.isModified('password')) next();

    const hash = await bcrypt.hash(this.password, 12);
    this.password = hash;

    this.passwordConfirm = undefined;
})

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;