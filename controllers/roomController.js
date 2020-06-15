const Room = require("../models/roomModel");
const catchAsync = require('./../utils/catchAsync');

exports.getAllRooms = catchAsync(async (req, res, next) => {
  const rooms = await Room.find();

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
    status: 'success',
    data: {
      room: newRoom
    }
  })
});

exports.deleteRoom = catchAsync(async (req, res, next) => {
  const room = await Room.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: "success",
    data: null,
  });
});