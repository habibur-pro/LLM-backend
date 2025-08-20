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
const mongoose_1 = __importDefault(require("mongoose"));
const http_status_1 = __importDefault(require("http-status"));
const payment_model_1 = __importDefault(require("../model/payment.model"));
const enum_1 = require("../enum");
const ApiError_1 = __importDefault(require("../helpers/ApiError"));
const order_model_1 = __importDefault(require("../model/order.model"));
const course_model_1 = __importDefault(require("../model/course.model"));
const config_1 = __importDefault(require("../config"));
const myClass_model_1 = __importDefault(require("../model/myClass.model"));
const module_model_1 = __importDefault(require("../model/module.model"));
const successPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const tranId = req.params.tranId;
        console.log({ tranId });
        const updatePayment = yield payment_model_1.default.findOneAndUpdate({ transactionId: tranId }, { status: enum_1.PaymentStatus.COMPLETE }, { new: true, session });
        if (!updatePayment) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'payment failed');
        }
        // update order status
        const updatedOrder = yield order_model_1.default.findByIdAndUpdate(updatePayment.order, {
            status: enum_1.OrderStatus.COMPLETE,
        }, { new: true, session });
        // update course seat
        const updatedCourse = yield course_model_1.default.findByIdAndUpdate(updatedOrder === null || updatedOrder === void 0 ? void 0 : updatedOrder.course, {
            $inc: { availableSeat: -1 },
        });
        // first module of this corse
        const firstModule = yield module_model_1.default.findById(updatedCourse === null || updatedCourse === void 0 ? void 0 : updatedCourse.modules[0]);
        // create my classes for getting course progress and watch lecture
        yield myClass_model_1.default.create({
            user: updatedOrder === null || updatedOrder === void 0 ? void 0 : updatedOrder.user,
            course: updatedOrder === null || updatedOrder === void 0 ? void 0 : updatedOrder.course,
            overallProgress: 0,
            prevLecture: firstModule === null || firstModule === void 0 ? void 0 : firstModule.lectures[0],
            currentLecture: firstModule === null || firstModule === void 0 ? void 0 : firstModule.lectures[0],
        });
        const url = `${config_1.default.frontend_url}/order/success`;
        yield session.commitTransaction();
        res.redirect(url);
    }
    catch (error) {
        yield session.abortTransaction();
        console.error('Payment success handling failed:', error);
        res.redirect(`${config_1.default.frontend_url}/order/fail`);
    }
    finally {
        yield session.endSession();
    }
});
const failedPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const tranId = req.params.tranId;
        const updatePayment = yield payment_model_1.default.findOneAndUpdate({ transactionId: tranId }, { status: enum_1.PaymentStatus.FAILED }, { new: true, session });
        yield order_model_1.default.findByIdAndUpdate(updatePayment === null || updatePayment === void 0 ? void 0 : updatePayment.order, {
            status: enum_1.OrderStatus.CANCELED,
        }, { new: true, session });
        const url = `${config_1.default.frontend_url}/order/fail`;
        yield session.commitTransaction();
        res.redirect(url);
    }
    catch (error) {
        yield session.abortTransaction();
        console.error('Payment success handling failed:', error);
        res.redirect(`${config_1.default.frontend_url}/order/fail`);
    }
    finally {
        yield session.endSession();
    }
});
const PaymentService = { successPayment, failedPayment };
exports.default = PaymentService;
