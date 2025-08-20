"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const enum_1 = require("../enum");
const idGenerator_1 = __importDefault(require("../helpers/idGenerator"));
const OrderSchema = new mongoose_1.Schema({
    id: { type: String, required: [true, 'id is required'], unique: true },
    amount: { type: Number, required: [true, 'amount is required'] },
    status: {
        type: String,
        enum: Object.values(enum_1.OrderStatus),
        default: enum_1.OrderStatus.PENDING,
    },
    payment: { type: mongoose_1.Schema.Types.ObjectId, ref: 'payment', default: null },
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'user' },
    course: { type: mongoose_1.Schema.Types.ObjectId, ref: 'course' },
}, { timestamps: true });
OrderSchema.pre('validate', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.id) {
            this.id = yield (0, idGenerator_1.default)(this.constructor);
        }
        next();
    });
});
const Order = (0, mongoose_1.model)('order', OrderSchema);
exports.default = Order;
