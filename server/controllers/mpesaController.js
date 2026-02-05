const { createDarajaService } = require("../services/darajaService");
const mpesaLogService = require("../services/mpesaLogService");
const { getDb } = require("../services/mongoClient");

const daraja = createDarajaService();

async function handleMpesaRequest(req, res, next, options) {
  const { apiName, action } = options;
  try {
    const requestPayload = req.body || {};

    await mpesaLogService.createLogEntry({
      kind: "REQUEST",
      api: apiName,
      reference: requestPayload.reference || requestPayload.Reference || null,
      requestPayload,
    });

    const responsePayload = await action(requestPayload);

    await mpesaLogService.createLogEntry({
      kind: "RESPONSE",
      api: apiName,
      reference: requestPayload.reference || requestPayload.Reference || null,
      statusCode: 200,
      status: "SUCCESS",
      requestPayload,
      responsePayload,
    });

    res.json(responsePayload);
  } catch (error) {
    await mpesaLogService.createLogEntry({
      kind: "RESPONSE",
      api: apiName,
      reference: req.body?.reference || req.body?.Reference || null,
      statusCode: error?.status || 500,
      status: "FAILED",
      requestPayload: req.body || {},
      responsePayload: { error: error.message || "Request failed" },
    });
    next(error);
  }
}

const stkPush = (req, res, next) =>
  handleMpesaRequest(req, res, next, {
    apiName: "stk-push",
    action: daraja.stkPushC2B,
  });

const b2c = (req, res, next) =>
  handleMpesaRequest(req, res, next, { apiName: "b2c", action: daraja.b2c });

const b2b = (req, res, next) =>
  handleMpesaRequest(req, res, next, { apiName: "b2b", action: daraja.b2b });

const transactionStatus = (req, res, next) =>
  handleMpesaRequest(req, res, next, {
    apiName: "transaction-status",
    action: daraja.transactionStatusQuery,
  });

const accountBalance = (req, res, next) =>
  handleMpesaRequest(req, res, next, {
    apiName: "account-balance",
    action: daraja.accountBalance,
  });

const reversal = (req, res, next) =>
  handleMpesaRequest(req, res, next, {
    apiName: "reversal",
    action: daraja.reversal,
  });

const qrCode = (req, res, next) =>
  handleMpesaRequest(req, res, next, { apiName: "qr", action: daraja.qrCode });

const ratiba = (req, res, next) =>
  handleMpesaRequest(req, res, next, { apiName: "ratiba", action: daraja.ratiba });

const pullTransactions = (req, res, next) =>
  handleMpesaRequest(req, res, next, {
    apiName: "pull-transactions",
    action: daraja.pullTransactions,
  });

async function transactionHistory(req, res, next) {
  try {
    const db = await getDb();
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const logs = await db
      .collection("mpesa_logs")
      .find({ kind: "RESPONSE" })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    const items = logs.map((log) => ({
      id: log._id,
      reference: log.reference || null,
      status: log.status || "UNKNOWN",
      amount: log?.requestPayload?.amount || log?.requestPayload?.Amount || null,
      phone:
        log?.requestPayload?.phone ||
        log?.requestPayload?.PhoneNumber ||
        log?.requestPayload?.PartyA ||
        null,
      time: log.createdAt,
    }));

    res.json(items);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  stkPush,
  b2c,
  b2b,
  transactionStatus,
  accountBalance,
  reversal,
  qrCode,
  ratiba,
  pullTransactions,
  transactionHistory,
};
