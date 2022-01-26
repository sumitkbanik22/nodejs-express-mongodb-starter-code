const errorResponse = require('../utils/errorResponse');
class AuthMiddleware {

    async authenticate(req, res, next) {
        
        try {

            const token = req.body.token || req.query.token || req.headers['Authorization'].split(' ')[1] || req.headers['x-access-token'].split(' ')[1];

            if (!token) {
                return errorResponse.getErrorMessage(res, 'A token is required for authentication', 403);
            }

            const decoded = jwt.verify(token, process.env.jwtSecretKey);
            req.user_id = decoded._id;
            next();

        } catch (err) {
            next(err);
        }
    }

};

module.exports = new AuthMiddleware();