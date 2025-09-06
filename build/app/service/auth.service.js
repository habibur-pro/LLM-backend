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
const http_status_1 = __importDefault(require("http-status"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ms_1 = __importDefault(require("ms"));
const config_1 = __importDefault(require("../config"));
const user_model_1 = __importDefault(require("../model/user.model"));
const ApiError_1 = __importDefault(require("../helpers/ApiError"));
const getErrorMessage_1 = require("../helpers/getErrorMessage");
const refreshToken_model_1 = __importDefault(require("../model/refreshToken.model"));
const refreshTokensDB = [];
function generateAccessToken(user) {
    return jsonwebtoken_1.default.sign(user, config_1.default.access_token_secret, {
        expiresIn: config_1.default.access_token_expires_in,
    });
}
const setRefreshToken = (res, token) => __awaiter(void 0, void 0, void 0, function* () {
    const refreshTokenExpiryMs = (0, ms_1.default)(config_1.default.refresh_token_expires_in);
    res.cookie('refreshToken', token, {
        httpOnly: true, // prevents JS access
        secure: false, //it will true for production
        sameSite: 'strict',
        maxAge: Number(refreshTokenExpiryMs), // cookie expiration in ms
        path: '/',
    });
});
const generateRefreshToken = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const expiresInMs = (0, ms_1.default)(config_1.default.refresh_token_expires_in);
    // calculate expiresAt date
    const expiresAt = new Date(Date.now() + expiresInMs);
    if (!expiresInMs)
        throw new Error('Invalid refresh token expiry');
    const newToken = jsonwebtoken_1.default.sign({ id: user.id }, config_1.default.refresh_token_secret, {
        expiresIn: config_1.default.refresh_token_expires_in,
    });
    // delete if token exist
    yield refreshToken_model_1.default.deleteMany({ userId: user.id });
    // create new refresh token
    yield refreshToken_model_1.default.create({
        userId: user.id,
        token: newToken,
        expiresAt,
    });
    return newToken;
});
const signup = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const isExist = yield user_model_1.default.findOne({
            $or: [{ email: payload.email }, { phone: payload.phone }],
        });
        if (isExist)
            throw new ApiError_1.default(http_status_1.default.CONFLICT, 'phone or email already exist');
        if (!payload.password) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Password is required');
        }
        // hash password
        const hashedPassword = yield bcrypt_1.default.hash(payload.password, 10);
        payload.password = hashedPassword;
        yield user_model_1.default.create(payload);
        return { message: 'success' };
    }
    catch (error) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, (0, getErrorMessage_1.getErrorMessage)(error) || 'something went wrong');
    }
});
const signin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const payload = req.body;
        if (!(payload === null || payload === void 0 ? void 0 : payload.email) || !(payload === null || payload === void 0 ? void 0 : payload.password)) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'email, password is required');
        }
        const user = yield user_model_1.default.findOne({ email: payload.email });
        if (!user) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'user not found');
        }
        const isMatched = yield bcrypt_1.default.compare(payload.password, user.password);
        if (!isMatched) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'wrong email or password');
        }
        const accessToken = generateAccessToken({
            id: user.id,
            email: user.email,
            role: user.role,
        });
        const refreshToken = yield generateRefreshToken(user);
        // set refresh token to cookie
        yield setRefreshToken(res, refreshToken);
        // calculate expiry timestamps
        const accessTokenExpiresInMs = (0, ms_1.default)(config_1.default.access_token_expires_in || '15m');
        const responseData = {
            id: user.id,
            name: user.name,
            accessToken,
            email: user.email,
            role: user.role,
            accessTokenExpiresAt: Date.now() + accessTokenExpiresInMs,
        };
        return responseData;
    }
    catch (error) {
        console.log('signin error', error);
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, (0, getErrorMessage_1.getErrorMessage)(error) || 'something went wrong');
    }
});
const verifySignin = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    if (!(payload === null || payload === void 0 ? void 0 : payload.email) || !(payload === null || payload === void 0 ? void 0 : payload.password)) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'email and password is required');
    }
    console.log(payload);
    const user = yield user_model_1.default.findOne({ email: payload.email });
    if (!user) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'user not found');
    }
    const isMatched = yield bcrypt_1.default.compare(payload.password, user.password);
    if (!isMatched) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'wrong email or password');
    }
    return { role: user.role };
});
const refreshToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { refreshToken } = req.cookies;
        console.log({ refreshToken });
        // check refresh token into cookie
        if (!refreshToken) {
            throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, 'Unauthorized access');
        }
        // check into db
        const savedToken = yield refreshToken_model_1.default.findOne({ token: refreshToken });
        if (!savedToken) {
            throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, 'Unauthorized access');
        }
        // Verify refresh token and extract user payload
        const token = jsonwebtoken_1.default.verify(refreshToken, config_1.default.refresh_token_secret);
        const user = yield user_model_1.default.findOne({ id: token.id });
        if (!user) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'user not found');
        }
        // Generate new access token
        const accessToken = generateAccessToken({
            id: user.id,
            email: user.email,
            role: user.role,
        });
        // Generate new refresh token
        const newRefreshToken = yield generateRefreshToken(user);
        // set refresh token to cookie
        yield setRefreshToken(res, newRefreshToken);
        // calculate expiry timestamps
        const accessTokenExpiresInMs = (0, ms_1.default)(config_1.default.access_token_expires_in || '15m');
        return {
            accessToken,
            accessTokenExpiresAt: Date.now() + accessTokenExpiresInMs,
        };
    }
    catch (error) {
        throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, 'Invalid refresh token');
    }
});
const AuthService = {
    signup,
    signin,
    verifySignin,
    refreshToken,
};
exports.default = AuthService;
