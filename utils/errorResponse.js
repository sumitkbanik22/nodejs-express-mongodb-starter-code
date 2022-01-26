class errorResponse {

    async getErrorMessage(res, errorMsg = null, status = 400) {
        res.status(status).json({
            'status': 'fail',
            'message': errorMsg ? errorMsg : 'Something went wrong!'
        });
    }
};

module.exports = new errorResponse();