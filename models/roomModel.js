const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomType: {
        type: String,
        enum: ['bedsitter', '1bedroom', '2bedroom'],
        required: true
    },
    roomCost: {
        type: Number,
        required: true
    },
    description: String,
});

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;