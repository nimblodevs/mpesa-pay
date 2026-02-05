const mpesaLogService = require("../services/mpesaLogService");

async function logRequest(req, res, next) {
  try {
    const {
      api,
      reference,
      transactionId,
      paymentRequestId,
      requestPayload,
    } = req.body || {};

    const entry = await mpesaLogService.createLogEntry({
      kind: "REQUEST",
      api,
      reference,
      transactionId,
      paymentRequestId,
      requestPayload,
    });

    res.status(201).json(entry);
  } catch (error) {
    next(error);
  }
}

async function logResponse(req, res, next) {
  try {
    const {
      api,
      reference,
      transactionId,
      paymentRequestId,
      statusCode,
      status,
      requestPayload,
      responsePayload,
    } = req.body || {};

    const entry = await mpesaLogService.createLogEntry({
      kind: "RESPONSE",
      api,
      reference,
      transactionId,
      paymentRequestId,
      statusCode,
      status,
      requestPayload,
      responsePayload,
    });

    res.status(201).json(entry);
  } catch (error) {
    next(error);
  }
}

async function logCallback(req, res, next) {
  try {
    const {
      eventType,
      payload,
      transactionId,
      paymentRequestId,
      api,
      reference,
      statusCode,
      status,
    } = req.body || {};

    const callbackLog = await mpesaLogService.createCallbackLog({
      eventType,
      payload,
      transactionId,
      paymentRequestId,
    });

    const mpesaLog = await mpesaLogService.createLogEntry({
      kind: "CALLBACK",
      api,
      reference,
      transactionId,
      paymentRequestId,
      statusCode,
      status,
      responsePayload: payload,
    });

    res.status(201).json({ callbackLog, mpesaLog });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  logRequest,
  logResponse,
  logCallback,
};
