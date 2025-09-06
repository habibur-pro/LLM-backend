"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const RefreshTokenSchema = new mongoose_1.Schema({
    token: {
        type: String,
        required: [true, 'token is required'],
        unique: true,
    },
    userId: {
        type: String,
        required: [true, 'token is required'],
    },
    expiresAt: {
        type: Date,
        required: [true, 'expiresAt is required'],
    },
});
const RefreshToken = (0, mongoose_1.model)('refresh-token', RefreshTokenSchema);
exports.default = RefreshToken;
