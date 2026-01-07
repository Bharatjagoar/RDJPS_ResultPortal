const SibApiV3Sdk = require("sib-api-v3-sdk");

// Configure Brevo client
const client = SibApiV3Sdk.ApiClient.instance;
const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY;

const emailApi = new SibApiV3Sdk.TransactionalEmailsApi();

/**
 * Generic email sender
 * @param {string} to
 * @param {string} subject
 * @param {string} message
 */
const sendEmail = async (to, subject, message) => {
  try {
    await emailApi.sendTransacEmail({
      sender: {
        email: process.env.EMAIL_FROM,
        name: "RDJPS Result Portal",
      },
      to: [{ email: to }],
      subject,
      textContent: message,
    });

    console.log("✅ Email sent to:", to);
  } catch (err) {
    console.error("❌ Brevo email error:", err?.response?.text || err.message);
    throw err;
  }
};

module.exports = sendEmail;
