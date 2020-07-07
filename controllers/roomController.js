const Room = require("../models/roomModel");
const catchAsync = require("./../utils/catchAsync");
const APIFeatures = require("./../utils/apiFeatures");

exports.getAllRooms = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Room.find(), req.query).filter().sort().limitFields().paginate();
    const rooms = await features.query;

    //sending the response
    res.status(200).json({
        status: "success",
        results: rooms.length,
        data: {
            rooms,
        },
    });
});

exports.getRoom = catchAsync(async (req, res, next) => {
    const room = await Room.findById(req.params.id);

    res.status(200).json({
        status: "success",
        data: {
            room,
        },
    });
});

exports.createRoom = catchAsync(async (req, res, next) => {
    const newRoom = await Room.create(req.body);

    res.status(201).json({
        status: "success",
        data: {
            room: newRoom,
        },
    });
});

exports.updateRoom = catchAsync(async (req, res, next) => {
    const newRoom = await Room.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        status: "success",
        data: {
            room: newRoom,
        },
    });
});

exports.deleteRoom = catchAsync(async (req, res, next) => {
    const room = await Room.findByIdAndDelete(req.params.id);

    res.status(200).json({
        status: "success",
        data: null,
    });
});
