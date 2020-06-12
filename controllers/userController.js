const mongoose = require('mongoose');
const User = require('./../models/userModel');

exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find();

        res.status(200).json({
            status: 'success',
            results: users.length,
            data: {
                users
            }
        })
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: err
        })
    };
}

exports.createUser = async (req, res, next) => {}