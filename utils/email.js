const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
    //Create a transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
        //Activate in gmail "less secure app" option
    });

    //define email options
    const mailOptions = {
        from: "'Kelvin Njiraini' <hello@njiraini.dev>",
        to: options.email,
        subject: options.subject,
        text: options.message,
        //html:
    };

    //actually send the email with nodemailer
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
