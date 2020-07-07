const crypto = require('crypto');
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require('validator');
const Room = require('./roomModel');

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
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date
}, {
    virtuals: {
        toJSON: true,
        toObject: true
    }
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) next();

    const hash = await bcrypt.hash(this.password, 12);
    this.password = hash;

    this.passwordConfirm = undefined;
});

userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;

    next();
});

userSchema.pre(/^find/, function (next) {
    this.find({
        active: {
            $ne: false
        }
    });
    next();
});

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.passwordChangedAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changedTimestamp;
    };

    //false here means that the password has not been changed
    return false;
};

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;


    return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;