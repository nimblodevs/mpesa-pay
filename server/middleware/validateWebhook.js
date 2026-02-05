const crypto = require("crypto");

function validateWebhookSignature(options = {}) {
  const {
    secret = process.env.WEBHOOK_SECRET,
    headerName = "x-webhook-signature",
    algorithm = "sha256",
  } = options;

  return (req, res, next) => {
    const signature = req.get(headerName);

    if (!secret) {
      return res.status(500).json({ error: "Webhook secret not configured" });
    }

    if (!signature) {
      return res.status(401).json({ error: "Missing webhook signature" });
    }

    const payload = JSON.stringify(req.body || {});
    const expected = crypto.createHmac(algorithm, secret).update(payload).digest("hex");

    if (signature !== expected) {
      return res.status(401).json({ error: "Invalid webhook signature" });
    }

    return next();
  };
}

module.exports = {
  validateWebhookSignature,
};
