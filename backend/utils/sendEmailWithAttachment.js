const SibApiV3Sdk = require("sib-api-v3-sdk");

const client = SibApiV3Sdk.ApiClient.instance;
client.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

const emailApi = new SibApiV3Sdk.TransactionalEmailsApi();

const sendEmailWithAttachment = async (
  to,
  subject,
  message,
  pdfBuffer,
  filename
) => {

  if (!Buffer.isBuffer(pdfBuffer)) {
    throw new Error("PDF is not a valid buffer");
  }


  console.log("PDF Buffer size (bytes):", pdfBuffer.length);
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  sendSmtpEmail.sender = {
    email: process.env.EMAIL_FROM,
    name: "RDJPS Result Portal",
  };
  console.log("this is to :: ",to)
  sendSmtpEmail.to = [{ email: to }];
  sendSmtpEmail.subject = subject;
  sendSmtpEmail.textContent = message;

  sendSmtpEmail.attachment = [
    {
      name: filename,
      content: pdfBuffer.toString("base64"),
      type: "application/pdf"
    }
  ];

  await emailApi.sendTransacEmail(sendSmtpEmail);
};
module.exports = sendEmailWithAttachment;