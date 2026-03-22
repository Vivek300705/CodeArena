import nodemailer from "nodemailer";

export const sendEmail = async (options) => {
  // Create a transporter using ethereal email or a real service
  // For dev, we can log the URL if it's ethereal
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.mailtrap.io",
    port: process.env.SMTP_PORT || 2525,
    auth: {
      user: process.env.SMTP_EMAIL || "test",
      pass: process.env.SMTP_PASSWORD || "test",
    },
  });

  const message = {
    from: `${process.env.FROM_NAME || "CodeArena"} <${process.env.FROM_EMAIL || "no-reply@codearena.com"}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || undefined,
  };

  const info = await transporter.sendMail(message);

  console.log("Message sent: %s", info.messageId);
};
