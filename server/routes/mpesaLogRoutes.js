const express = require("express");
const mpesaLogController = require("../controllers/mpesaLogController");
const { requireFields } = require("../middleware/validateRequest");
const { validateWebhookSignature } = require("../middleware/validateWebhook");

const router = express.Router();

router.post(
  "/requests",
  requireFields(["api", "requestPayload"]),
  mpesaLogController.logRequest
);
router.post(
  "/responses",
  requireFields(["api", "responsePayload"]),
  mpesaLogController.logResponse
);
router.post(
  "/callbacks",
  validateWebhookSignature(),
  requireFields(["payload"]),
  mpesaLogController.logCallback
);

module.exports = router;
