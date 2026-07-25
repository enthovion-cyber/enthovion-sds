const axios = require("axios");
const env = require("../../config/env");

const sendWorkflowWebhook = async ({ event, payload }) => {
  const url = env.integrations?.workflowWebhookUrl;
  if (!url) return { delivered: false, reason: "webhook_not_configured" };
  try {
    await axios.post(
      url,
      {
        event,
        payload,
        sent_at: new Date().toISOString(),
      },
      { timeout: 7000 }
    );
    return { delivered: true };
  } catch (error) {
    return { delivered: false, reason: error.message };
  }
};

module.exports = { sendWorkflowWebhook };
