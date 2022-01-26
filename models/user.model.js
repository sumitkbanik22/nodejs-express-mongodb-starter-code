const Joi = require('joi');
const constants = require('../helpers/appConstants');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    firstName: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50
    },
    lastName: {
        type: String,
        required: false,
        minlength: 3,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255,
        unique: true
    },
    phone: {
        type: String,
        required: false,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255
    },
    userRole: {
        type: Number,
        required: true,
        enum: [constants.userRole.user, constants.userRole.admin]
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', UserSchema);

function validateUserRegister(user) {
    const schema = Joi.object({
        firstName: Joi.string().min(3).max(50).required(),
        lastName: Joi.string().min(3).max(50).optional(),
        email: Joi.string().min(5).max(255).required().email(),
        phone: Joi.number().optional(),
        password: Joi.string().min(5).max(255).required(),
        userRole: Joi.number().required()
    });
    const validation = schema.validate(user);
    return validation;
}

function validateUserLogin(req) {
    const schema = Joi.object({
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(5).max(255).required()
    });
    const validation = schema.validate(req);
    return validation;
}

exports.User = User;
exports.validateUserRegsiter = validateUserRegister;
exports.validateUserLogin = validateUserLogin;