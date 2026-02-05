const { getDb } = require("./mongoClient");

async function createLogEntry(data) {
  const db = await getDb();
  const document = {
    ...data,
    createdAt: new Date(),
  };
  const result = await db.collection("mpesa_logs").insertOne(document);
  return { ...document, id: result.insertedId };
}

async function createCallbackLog({ eventType, payload, transactionId, paymentRequestId }) {
  const db = await getDb();
  const document = {
    eventType,
    payload,
    transactionId,
    paymentRequestId,
    createdAt: new Date(),
  };
  const result = await db.collection("callback_logs").insertOne(document);
  return { ...document, id: result.insertedId };
}

module.exports = {
  createLogEntry,
  createCallbackLog,
};
