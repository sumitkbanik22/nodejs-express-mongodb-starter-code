require('dotenv').config();
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const express = require('express');
const cors = require('cors')
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const HTTPErrors = require('http-errors');
const errorHandler = require('./utils/errorHandler');
const apiRoutes = require("./routes/api");

const app = express();

// Implement CORS
app.use(cors());

const mongoose = require('./configs/database');

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log('Server started on port:', PORT);
}).on('error', (error) => {
    console.log('error : ', error.message)
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, Origin');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Expose-Headers', 'x-access-token');
    next();
});

// routes
app.use('/api', apiRoutes);

// This should be the last route else any after it wont work
app.use('*', (req, res) => {
    res.status(404).json({
      success: 'false',
      message: 'Page not found',
      error: {
        statusCode: 404,
        message: 'You reached a route that is not defined on this server',
      },
    });
});

// catch 404 and forward to error handler
app.use(function(req, res, next){
    next(HTTPErrors(404));
});

// Error Handler - Log errors
app.use(function(err, req, res, next) {
    errorHandler.handleError(err, req, res, next);
});