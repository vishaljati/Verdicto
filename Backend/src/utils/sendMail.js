import nodemailer from "nodemailer";

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
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Welcome to Verdicto</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body
    style="
      margin: 0;
      padding: 0;
      background-color: #f4f4f7;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: #111827;
    "
  >
    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      style="background-color: #f4f4f7; padding: 24px 0;"
    >
      <tr>
        <td align="center">
          <table
            width="100%"
            cellpadding="0"
            cellspacing="0"
            style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;"
          >
            <!-- Header -->
            <tr>
              <td
                style="
                  padding: 20px 24px;
                  background: linear-gradient(135deg, #4338ca, #1d4ed8);
                  color: #f9fafb;
                "
              >
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="left">
                      <div
                        style="
                          font-size: 20px;
                          font-weight: 700;
                          letter-spacing: 0.03em;
                        "
                      >
                        Verdicto
                      </div>
                      <div
                        style="
                          font-size: 12px;
                          margin-top: 4px;
                          opacity: 0.9;
                        "
                      >
                        A structured multi-agent debate that transforms confusion into confident action.
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding: 24px;">
                <p style="margin: 0 0 12px; font-size: 16px; font-weight: 600;">
                  Hi {{name}},
                </p>

                <p style="margin: 0 0 12px; font-size: 14px; line-height: 1.6;">
                  Welcome to <strong>Verdicto</strong> 👋
                </p>

                <p style="margin: 0 0 12px; font-size: 14px; line-height: 1.6;">
                  Verdicto uses a structured multi-agent debate system to help you cut through noise, analyze options, and move from confusion to <strong>confident, well-informed decisions</strong>.
                </p>

                <p style="margin: 0 0 8px; font-size: 14px; line-height: 1.6;">
                  If you didn’t create this account, you can safely ignore this email.
                </p>

                <p style="margin: 0; font-size: 14px; line-height: 1.6;">
                  Regards,<br />
                  <strong>The Verdicto Team</strong>
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td
                style="
                  padding: 16px 24px 20px;
                  background-color: #f9fafb;
                  border-top: 1px solid #e5e7eb;
                  text-align: center;
                "
              >
                <p
                  style="
                    margin: 0 0 4px;
                    font-size: 11px;
                    color: #9ca3af;
                    line-height: 1.4;
                  "
                >
                  You are receiving this email because you signed up for Verdicto.
                </p>
                <p
                  style="
                    margin: 0;
                    font-size: 11px;
                    color: #9ca3af;
                    line-height: 1.4;
                  "
                >
                  © 2025 Verdicto. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
 </html>`;

  return sendMail({ to, subject, html });
}

// 2) OTP email
async function sendOtpEmail({ to, name, otp }) {
  const subject = "Verdicto: Your OTP Code";
  const html = `
    
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Your Verdicto OTP</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body
    style="
      margin: 0;
      padding: 0;
      background-color: #f4f4f7;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: #111827;
    "
  >
    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      style="background-color: #f4f4f7; padding: 24px 0;"
    >
      <tr>
        <td align="center">
          <table
            width="100%"
            cellpadding="0"
            cellspacing="0"
            style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;"
          >
            <!-- Header -->
            <tr>
              <td
                style="
                  padding: 20px 24px;
                  background: linear-gradient(135deg, #4338ca, #1d4ed8);
                  color: #f9fafb;
                "
              >
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="left">
                      <div
                        style="
                          font-size: 20px;
                          font-weight: 700;
                          letter-spacing: 0.03em;
                        "
                      >
                        Verdicto
                      </div>
                      <div
                        style="
                          font-size: 12px;
                          margin-top: 4px;
                          opacity: 0.9;
                        "
                      >
                        A structured multi-agent debate that transforms confusion into confident action.
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding: 24px;">
                <p style="margin: 0 0 12px; font-size: 16px; font-weight: 600;">
                  Hi ${name},
                </p>

                <p style="margin: 0 0 12px; font-size: 14px; line-height: 1.6;">
                  Use the one-time password (OTP) below to continue your action in Verdicto.
                </p>

                <!-- OTP Box -->
                <table
                  cellpadding="0"
                  cellspacing="0"
                  align="center"
                  style="margin: 20px auto 16px;"
                >
                  <tr>
                    <td
                      style="
                        padding: 14px 28px;
                        border-radius: 999px;
                        border: 1px solid #e5e7eb;
                        background-color: #f9fafb;
                        font-size: 22px;
                        font-weight: 700;
                        letter-spacing: 0.35em;
                        text-align: center;
                        color: #111827;
                      "
                    >
                      ${otp}
                    </td>
                  </tr>
                </table>

                <p style="margin: 0 0 10px; font-size: 13px; line-height: 1.6; color: #4b5563; text-align: center;">
                  This OTP is valid for <strong> 2 minutes</strong>.
                </p>

                <p style="margin: 0 0 16px; font-size: 13px; line-height: 1.6; color: #4b5563; text-align: center;">
                  For your security, do not share this code with anyone.
                </p>

                <p style="margin: 0 0 8px; font-size: 13px; line-height: 1.6; color: #6b7280;">
                  If you did not request this code, you can ignore this email. Your account will remain secure.
                </p>

                <p style="margin: 0; font-size: 14px; line-height: 1.6;">
                  Regards,<br />
                  <strong>The Verdicto Team</strong>
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td
                style="
                  padding: 16px 24px 20px;
                  background-color: #f9fafb;
                  border-top: 1px solid #e5e7eb;
                  text-align: center;
                "
              >
                <p
                  style="
                    margin: 0 0 4px;
                    font-size: 11px;
                    color: #9ca3af;
                    line-height: 1.4;
                  "
                >
                  You received this email because an OTP was requested for your Verdicto account.
                </p>
                <p
                  style="
                    margin: 0;
                    font-size: 11px;
                    color: #9ca3af;
                    line-height: 1.4;
                  "
                >
                  © 2025 Verdicto. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return sendMail({ to, subject, html });
}

export { sendMail, sendWelcomeEmail, sendOtpEmail };
