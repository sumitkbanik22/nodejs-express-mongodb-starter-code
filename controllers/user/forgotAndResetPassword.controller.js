const Joi = require('joi');
const { User } = require('../../models/user.model');
const { Token } = require('../../models/token.model');
const sendEmail = require('../../utils/sendEmail');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const errorResponse = require('../../utils/errorResponse');
const successResponse = require('../../utils/successResponse');

class ForgotAndResetPasswordController {

    async forgotPasswordRequestReset (req, res, next) {

        try {

            const { error } = validateEmail(req.body);
            if (error) {
                return errorResponse.getErrorMessage(res, error.details[0].message);
            }

            // Now find the user by their email address
            let user = await User.findOne({ email : req.body.email });
            if (!user) {
                return errorResponse.getErrorMessage(res, "User with given email doesn't exist!");
            }

            let resetPasswordToken = crypto.randomBytes(32).toString('hex');
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(resetPasswordToken, salt);

            await new Token({
                userId: user._id,
                token: hash,
                createdAt: Date.now(),
            }).save();

            const link = `${process.env.HOST}/user/passwordReset?token=${resetPasswordToken}&userId=${user._id}`;

            const result = await sendEmail.sendEmail(
                user.email,
                'Password reset request',
                {
                    name: user.firstName + (user.lastName ? ' ' + user.lastName : ''),
                    link: link,
                },
                './templates/requestPasswordReset.handlebars'
            );

            if(result.status && result.status == 'success') {
                return successResponse.getSuccessMessage(res, result.message);
            } else if (result.status && result.status == 'fail') {
                next(result.err);
            }

        } catch(err) {
            next(err);
        }
    }

    async resetPassword (req, res, next) {

        try {

            const { error } = validatePassword(req.body);
            if (error) {
                return errorResponse.getErrorMessage(res, error.details[0].message);
            }

            const user = await User.findById(req.query.userId);

            if (!user) {
                return errorResponse.getErrorMessage(res," User with given email doesn't exist!");
            }

            const token = await Token.findOne({
                userId: user._id
            });

            if (!token) {
                return errorResponse.getErrorMessage(res, 'Invalid link or expired');
            } else {
                const salt = await bcrypt.genSalt(10);
                const changedPassword = await bcrypt.hash(req.body.password, salt);
                await User.updateOne(
                    {_id: user._id},
                    { $set: { password: changedPassword}},
                    {new: true}
                );

                await sendEmail.sendEmail(
                    user.email,
                    'Password reset successfully',
                    {
                        name: user.firstName + (user.lastName ? ' ' + user.lastName : '')
                    },
                    './templates/passwordResetSuccessful.handlebars'
                );

                await token.deleteOne();
            
                res.send({status: "success", message: "Password reset successfull"});
            }

        } catch (err) {
            next(err);
        }
    }

};

function validateEmail(req) {
    const schema = Joi.object({
        email: Joi.string().min(5).max(255).required().email()
    });
    const validation = schema.validate(req);
    return validation;
}

function validatePassword(req) {
    const schema = Joi.object({
        password: Joi.string().min(5).max(255).required()
    });
    const validation = schema.validate(req);
    return validation;
}

module.exports = new ForgotAndResetPasswordController();