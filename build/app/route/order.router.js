"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_controller_1 = __importDefault(require("../controller/order.controller"));
const router = (0, express_1.Router)();
router.post('/', order_controller_1.default.placeOrder);
router.get('/', order_controller_1.default.getAllOrder);
const OrderRouter = router;
exports.default = OrderRouter;
