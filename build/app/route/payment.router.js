"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_controller_1 = __importDefault(require("../controller/payment.controller"));
const router = (0, express_1.Router)();
router.post('/success/:tranId', payment_controller_1.default.successPayment);
router.post('/fail/:tranId', payment_controller_1.default.failedPayment);
const PaymentRouter = router;
exports.default = PaymentRouter;
