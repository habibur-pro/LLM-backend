"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../helpers/ApiError"));
const config_1 = __importDefault(require("../config"));
// ✅ Reusable authorize middleware
const authorize = (...allowedRoles) => (req, res, next) => {
    try {
        // 1. Extract token
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, 'No token provided');
        }
        const token = authHeader.split(' ')[1];
        // 2. Verify token
        const decoded = jsonwebtoken_1.default.verify(token, config_1.default.access_token_secret);
        if (!decoded) {
            throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, 'Invalid token');
        }
        // 3. Role check (if roles are passed)
        if (allowedRoles.length && !allowedRoles.includes(decoded.role)) {
            throw new ApiError_1.default(http_status_1.default.FORBIDDEN, 'Access denied');
        }
        // 4. Attach user to request
        req.user = decoded;
        next();
    }
    catch (error) {
        next(error instanceof ApiError_1.default
            ? error
            : new ApiError_1.default(http_status_1.default.UNAUTHORIZED, 'Unauthorized'));
    }
};
exports.authorize = authorize;
