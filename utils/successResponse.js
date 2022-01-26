
class SuccessResponse {

    async getSuccessMessage(res, data = null, status=200) {
        res.status(status).json({
            'status': 'success',
            'response': data ? data : 'Request processed successfully!'
        });
    }

};

module.exports = new SuccessResponse();