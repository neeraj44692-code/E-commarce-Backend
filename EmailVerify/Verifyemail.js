import "dotenv/config";
import nodemailer from "nodemailer";

export const VerifyEmail = (token, email) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailConfiguration = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Email Verification",

    // This would be the text of email body
    text: `Hi! There, You have recently visited
    our website and enterd your email.
    Please follow the given link to verify your email
    http://localhost:5173/verify/${token}
    Thanks`,
  };
  transporter.sendMail(mailConfiguration, function (error, info) {
    if (error) throw Error(error);
    console.log("Email sent Successfully");
    console.log("info");
  });
};
