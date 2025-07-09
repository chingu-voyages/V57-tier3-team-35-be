// const nodemailer = require("nodemailer");

// const sendEmail = async ({ to, subject, html }) => {
//   const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS
//     }
//   });

//   await transporter.sendMail({
//     from: `"Your Store" <${process.env.EMAIL_USER}>`,
//     to,
//     subject,
//     html
//   });
// };
// const sendEmail = async ({ to, subject, html }) => {
//     const transporter = nodemailer.createTransport({
//         host: process.env.NODEMAILER_HOST,
//         port: process.env.NODEMAILER_PORT,
//         auth: {
//             user: process.env.NODEMAILER_USER,
//             pass: process.env.NODEMAILER_PASS
//         }
//     });

//     await transporter.sendMail({
//         from: "Your Store shivam new",
//         to,
//         subject,
//         html
//     });
// };

// const { Resend } = require('resend');

// const resend = new Resend(process.env.RESEND_API_KEY);

// const sendEmail = async ({ to, subject, html }) => {
//     try {
//         const response = await resend.emails.send({
//             from: process.env.EMAIL_FROM,
//             to,
//             subject,
//             html
//         });

//         return response;
//     } catch (error) {
//         console.error("Email send error:", error);
//         throw new Error("Failed to send email");
//     }
// };

// module.exports = sendEmail;
