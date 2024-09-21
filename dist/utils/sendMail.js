"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendEmail = (option) => {
    const transporter = nodemailer_1.default.createTransport({
        host: process.env.EMAIL_HOST,
        service: process.env.EMAIL_SERVICE,
        auth: {
            user: process.env.EMAIL_MAIL,
            pass: process.env.EMAIL_PASSWORD
        }
    });
    const mailOption = {
        from: process.env.EMAIL_MAIL,
        to: option.to,
        subject: option.subject,
        html: option.text
    };
    transporter.sendMail(mailOption, function (err, info) {
        if (err) {
            console.log(err);
        }
        else {
            console.log(info);
        }
    });
};
exports.default = sendEmail;
