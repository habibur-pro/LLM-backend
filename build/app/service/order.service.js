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
/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-ignore
const sslcommerz_lts_1 = __importDefault(require("sslcommerz-lts"));
const mongoose_1 = __importDefault(require("mongoose"));
const user_model_1 = __importDefault(require("../model/user.model"));
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../helpers/ApiError"));
const course_model_1 = __importDefault(require("../model/course.model"));
const order_model_1 = __importDefault(require("../model/order.model"));
const config_1 = __importDefault(require("../config"));
const getErrorMessage_1 = require("../helpers/getErrorMessage");
const payment_model_1 = __importDefault(require("../model/payment.model"));
const myClass_model_1 = __importDefault(require("../model/myClass.model"));
const placeOrder = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = req.body;
    console.log('payload', payload);
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const user = yield user_model_1.default.findOne({ id: payload.userId }).session(session);
        if (!user) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'user not found');
        }
        const course = yield course_model_1.default.findOne({ id: payload.courseId }).session(session);
        if (!course) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'course not found');
        }
        // check is student already enroled or not
        const myClass = yield myClass_model_1.default.findOne({
            course: course._id,
            user: user._id,
        });
        if (myClass) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'You already enrolled this course');
        }
        if (course.availableSeat < 1) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'there are not seat available');
        }
        const orderData = {
            amount: course.price,
            user: user._id,
            course: course._id,
        };
        const newOrder = yield order_model_1.default.create([orderData], { session });
        const tranId = `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const paymentData = {
            amount: course.price,
            user: user._id,
            order: newOrder[0]._id,
            transactionId: tranId,
            gateway: 'SSL',
        };
        const newPayment = yield payment_model_1.default.create([paymentData], { session });
        // payment start
        yield order_model_1.default.findOneAndUpdate({ id: newOrder[0].id }, { payment: newPayment[0]._id }, { new: true, session });
        const store_id = config_1.default.ssl_store_id;
        const store_passwd = config_1.default.ssl_store_pass;
        const is_live = config_1.default.is_payment_live === 'true' ? true : false;
        const baseUrl = `${config_1.default.backend_url}/api/v1/payments`;
        // const tranId = `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`
        const data = {
            total_amount: course.price,
            currency: 'BDT',
            tran_id: tranId, // use unique tran_id for each api call
            success_url: `${baseUrl}/success/${tranId}`,
            fail_url: `${baseUrl}/fail/${tranId}`,
            cancel_url: `${baseUrl}/fail/${tranId}`,
            ipn_url: `${baseUrl}/ipn`,
            shipping_method: 'Courier',
            product_name: `${course.title || '-'}`,
            product_category: 'course',
            product_profile: 'general',
            cus_name: user.name,
            cus_email: user.email || '',
            cus_add1: 'f',
            cus_add2: 'f',
            cus_city: 'f',
            cus_state: 'f',
            cus_postcode: 1000,
            cus_country: 'Bangladesh',
            cus_phone: user.phone || '-',
            cus_fax: 'f',
            ship_name: user.name,
            ship_add1: 'f',
            ship_add2: 'f',
            ship_city: 'f',
            ship_state: 'f',
            ship_postcode: 1000,
            ship_country: 'Bangladesh',
        };
        const sslcz = new sslcommerz_lts_1.default(store_id, store_passwd, is_live);
        const apiResponse = yield sslcz.init(data);
        const gatewayPageURL = apiResponse === null || apiResponse === void 0 ? void 0 : apiResponse.GatewayPageURL;
        yield session.commitTransaction();
        return { url: gatewayPageURL };
    }
    catch (error) {
        console.log(error);
        yield session.abortTransaction();
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, (0, getErrorMessage_1.getErrorMessage)(error));
    }
    finally {
        yield session.endSession();
    }
});
const getAllOrder = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield order_model_1.default.find().populate(['user', 'course', 'payment']);
});
const OrderService = { placeOrder, getAllOrder };
exports.default = OrderService;
