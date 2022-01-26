const express = require("express");
const router = express.Router();

const userController = require('../../controllers/user/user.controller');
const forgotAndResetPasswordController = require('../../controllers/user/forgotAndResetPassword.controller');

// controllers
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.post('/forgotPassword', forgotAndResetPasswordController.forgotPasswordRequestReset);
router.post('/passwordReset', forgotAndResetPasswordController.resetPassword);

module.exports = router;