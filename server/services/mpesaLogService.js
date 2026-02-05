const prisma = require("./prismaClient");

function createLogEntry(data) {
  return prisma.mpesaLog.create({
    data,
  });
}

function createCallbackLog({ eventType, payload, transactionId, paymentRequestId }) {
  return prisma.callbackLog.create({
    data: {
      eventType,
      payload,
      transactionId,
      paymentRequestId,
    },
  });
}

module.exports = {
  createLogEntry,
  createCallbackLog,
};
