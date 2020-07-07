const mongoose = require('mongoose');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require("./../utils/appError");

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        status: 'success',
        results: users.length,
        data: {
            users
        }
    })
});

exports.updateMe = catchAsync(async (req, res, next) => {
    // throw err if someone uses this handler for password update
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError('This route is not meant for password updates! Pleae use /updateMyPassword route for that.', 400));
    }

    //filter out the field names that should not be changed
    const filteredBody = filterObj(req.body, 'name', 'email');
    //update the user data
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: 'success',
        data: updatedUser
    })
});

exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, {
        active: false
    })

    res.status(204).json({
        status: 'success',
        data: null
    });
});