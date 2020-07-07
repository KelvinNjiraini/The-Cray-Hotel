const express = require("express");
const morgan = require("morgan");
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const roomRouter = require('./Routes/roomRoutes');
const userRouter = require('./Routes/userRoutes');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

//GLOBAL MIDDLEWARES
//Set Security HTTP headers
app.use(helmet({
    whitelist: ['roomCost', 'roomType']
}));

//Development logging
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

//reading the data from the body into req.body (body parser)
app.use(express.json({
    limit: '10kb'
}));

//data sanitization against noSQL query injection
app.use(mongoSanitize());
//data sanitization against XSS
app.use(xss());
//prevent parameter pollution
app.use(hpp());
//limiting the number of requests from the same IP address
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour'
});
app.use('/api', limiter);

// app.use(express.static(`${__dirname}/public`));

app.use('/api/v1/rooms', roomRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
    next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});
app.use(globalErrorHandler);

module.exports = app;