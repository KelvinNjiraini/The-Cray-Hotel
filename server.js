const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({
    path: './config.env'
})
const app = require('./app');
mongoose
    .connect(process.env.LOCAL_DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
    })
    .then(() => console.log('DB connections successful'));

const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});