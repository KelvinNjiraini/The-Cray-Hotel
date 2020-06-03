const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomType: {
        type: String,
        enum: ['bedsitter', '1bedroom', '2bedroom'],
        required: true
    },
    roomCost: {
        type: Number,
        enum: [8000, 15000, 22000],
        required: true
    },
    description: String,
});

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;