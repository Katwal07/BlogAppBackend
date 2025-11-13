const nodeMailer = require("nodemailer");
const asyncHandler = require("express-async-handler");
const dotenv = require("dotenv");

dotenv.config();

const transporter = nodeMailer.createTransport({
    service: "gmail",
    auth:{
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    }
});

const sendOtpEmail = asyncHandler ( async (email, otp) => {
    if (!email || !otp) throw new Error("Missing email or OTP for sendOtpEmail");

    transporter.sendMail({
        from: `"Auth System" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your OTP Code",
        text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
    });
});

module.exports = {sendOtpEmail};