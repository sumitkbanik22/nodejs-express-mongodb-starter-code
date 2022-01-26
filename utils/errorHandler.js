const HTTPErrors = require('http-errors');
const HTTPStatuses = require('statuses');
const logger = require('morgan');

class ErrorHandler {

    handleError(err, req, res, next) {

        let messageToSend;

        if (err instanceof HTTPErrors.HttpError){
            // handle http err
            messageToSend = {message: err.message};
    
            if(process.env.NODE_ENV === 'development')
                messageToSend.stack = err.stack;
    
            messageToSend.status = err.statusCode;
        }
        else if (err && err.message) {
            messageToSend = {message: err.message};
    
            if(process.env.NODE_ENV === 'development')
                messageToSend.stack = err.stack;
    
            messageToSend.status = err.statusCode || 422;
        }
        else{
            // log other than HTTP errors (these are created by me manually, so I can log them when thrown)
            logger.error(err.stack);
        }
    
        if(process.env.NODE_ENV === 'production' && !messageToSend){
            messageToSend = {message: 'Something broke', status: 500};
        }
    
        if(messageToSend) {
    
            let statusCode = parseInt(messageToSend.status,10);
            let statusName = HTTPStatuses[statusCode];
    
            res.status(statusCode);
    
            // respond with html page
            // if (req.accepts('html')) {
            //     res.send('<html><head><title>'+statusCode+' '+statusName+'</title></head><body><h1>'+statusCode+' '+statusName+'</h1>'+messageToSend.message+'<br/><br/>'+(messageToSend.stack ? messageToSend.stack : '')+'</body></html>');
            //     return;
            // }
    
            // respond with json
            if (req.accepts('json')) {
                let responseObject = { error: statusName, code: statusCode, message: messageToSend.message };
    
                if(messageToSend.stack)
                    responseObject.stack = messageToSend.stack;
    
                res.send(responseObject);
                return;
            }
    
            // default to plain-text. send()
            res.type('txt').send(statusName+' '+messageToSend.message);
            return;
        }
    
        // if this is not HTTP error and we are not in production, let express handle it the default way
        next(err);
    }
};

module.exports = new ErrorHandler();