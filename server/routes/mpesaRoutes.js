const express = require("express");
const mpesaController = require("../controllers/mpesaController");
const { requireFields } = require("../middleware/validateRequest");

const router = express.Router();

router.post(
  "/stk-push",
  requireFields(["phone", "amount"]),
  mpesaController.stkPush
);
router.post("/b2c", mpesaController.b2c);
router.post("/b2b", mpesaController.b2b);
router.post("/transaction-status", mpesaController.transactionStatus);
router.post("/account-balance", mpesaController.accountBalance);
router.post("/reversal", mpesaController.reversal);
router.post("/qr", mpesaController.qrCode);
router.post("/ratiba", mpesaController.ratiba);
router.post("/pull-transactions", mpesaController.pullTransactions);

router.get("/transactions", mpesaController.transactionHistory);

module.exports = router;
