"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sendResponse = (res, resData) => {
    return res.status(resData.statusCode).json({
        status: resData.statusCode,
        success: resData.success,
        message: resData.message,
        data: resData.data || { message: 'done' },
    });
};
exports.default = sendResponse;
