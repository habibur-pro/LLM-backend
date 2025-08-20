"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signUpValidationSchema = void 0;
const zod_1 = require("zod");
exports.signUpValidationSchema = zod_1.z.object({
    fullName: zod_1.z.string().nonempty('fullName is required'),
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    otpCode: zod_1.z.string().nonempty('OTP code is required'),
    otpExpiresAt: zod_1.z.instanceof(Date).optional(),
});
