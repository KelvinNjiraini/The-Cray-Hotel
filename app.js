const express = require("express");
const morgan = require("morgan");
const roomRouter = require('./Routes/roomRoutes');
const userRouter = require('./Routes/userRoutes');

const app = express();

if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}
app.use(express.json());

// app.use(express.static(`${__dirname}/public`));

app.use('/api/v1/rooms', roomRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;