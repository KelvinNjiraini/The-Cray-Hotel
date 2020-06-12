const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');
const router = express();


router.post('/signup', authController.signup);

router
    .route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser)


module.exports = router;