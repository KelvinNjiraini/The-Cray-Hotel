const express = require('express');
const roomController = require('./../controllers/roomController');
const authController = require('./../controllers/authController');
const router = express.Router();

router
    .route('/')
    .get(authController.protect, roomController.getAllRooms)
    .post(roomController.createRoom);

router
    .route('/:id')
    .get(roomController.getRoom)
    .delete(authController.protect, authController.restrictTo('admin', 'custodian'), roomController.deleteRoom)
    .patch(roomController.updateRoom);

module.exports = router;