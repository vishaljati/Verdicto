import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`;


async function sendMail({ to, subject, html, text }) {
  const mailOptions = {
    from: FROM,
    to,
    subject,
    html,
    text,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log("Mail sent:", info.messageId);
  return info;
}


// 1) Welcome email
async function sendWelcomeEmail({ to, name }) {
  const subject = `Welcome, ${name}! to Verdicto`;
  const html = `
    <h2>Hey ${name},</h2>
    <p>Welcome to Verdicto</p>
    <p>Glad to have you here.</p>
  `;

  return sendMail({ to, subject, html });
}



// 2) OTP email
async function sendOtpEmail({ to, name, otp }) {
  const subject = "Verdicto: Your OTP Code";
  const html = `
    
    <h2>Hi ${name},</h2>
    <p>Your OTP is: <b>${otp}</b></p>
    <p>It will expire in 10 minutes.</p>
    <br><br>
    <h3>From Verdicto Team</h3>
  `;

  return sendMail({ to, subject, html });
}



export {
  sendMail,
  sendWelcomeEmail,
  sendOtpEmail,
}