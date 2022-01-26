const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const { User, validateUserRegsiter, validateUserLogin } = require('../../models/user.model');
const successResponse = require('../../utils/successResponse');
const errorResponse = require('../../utils/errorResponse');
const sendEmail = require('../../utils/sendEmail');

class UserController {

    async registerUser(req, res, next) {

        try {

            // first validare the request
            const { error } = validateUserRegsiter(req.body);
            if (error) {
                return errorResponse.getErrorMessage(res, error.details[0].message);
            }

            // check if user already exists
            let user = await User.findOne({ email : req.body.email });
            if (user) {
                return errorResponse.getErrorMessage(res, 'User already exists!');
            } else {
                // insert new user if they do not exist yet
                user = new User(_.pick(req.body, ['firstName', 'lastName', 'email', 'phone', 'password', 'userRole']));
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
                await user.save();

                await sendEmail.sendEmail(
                    user.email,
                    'Welcome',
                    {
                        name: user.firstName + (user.lastName ? ' ' + user.lastName : '')
                    },
                    './templates/welcome.handlebars'
                );

                return successResponse.getSuccessMessage(res, _.pick(user, ['firstName', 'lastName', 'email', 'phone', 'password', 'userRole']));
            }

        } catch(err) {
            next(err);
        }
    }

    async loginUser(req, res, next) {

        try {

            // first validare the request
            const { error } = validateUserLogin(req.body);
            if (error) {
                return errorResponse.getErrorMessage(res, error.details[0].message);
            }

            // Now find the user by their email address
            let user = await User.findOne({ email : req.body.email })
            if (!user) {
                return errorResponse.getErrorMessage(res, 'Incorrect email or password!');
            }

            // then validate the credentials in mongodb match thode provided in the request
            const validPassword = await bcrypt.compare(req.body.password, user.password);
            if (!validPassword) {
                return errorResponse.getErrorMessage(res, 'Incorrect email or password!');
            }
            const token = jwt.sign({ _id: user._id }, process.env.jwtSecretKey);
            res.header('x-access-token', token);
            return successResponse.getSuccessMessage(res, _.pick(user, ['_id', 'firstName', 'lastName', 'email', 'phone', 'userRole']));

        } catch(err) {
            next(err);
        }
    }
};

module.exports = new UserController();

