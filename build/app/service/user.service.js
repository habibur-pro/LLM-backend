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
const enum_1 = require("../enum");
const ApiError_1 = __importDefault(require("../helpers/ApiError"));
const user_model_1 = __importDefault(require("../model/user.model"));
const http_status_1 = __importDefault(require("http-status"));
const getAllStudent = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield user_model_1.default.find({ role: enum_1.UserRole.Student })
        .sort({ createdAt: -1 })
        .exec();
});
const getAllInstructor = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield user_model_1.default.find({ role: enum_1.UserRole.instructor }).exec();
});
const updateUser = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.userId;
    const payload = req.body;
    const user = yield user_model_1.default.findOneAndUpdate({ id: userId });
    if (!user) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'user not round');
    }
    // If trying to change role, ensure requester is Admin
    if (payload.role && (!req.user || req.user.role !== enum_1.UserRole.Admin)) {
        throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, 'You have no permission to change role');
    }
    yield user_model_1.default.findOneAndUpdate({ id: userId }, payload, { new: true });
    return { message: 'user updated' };
});
const UserService = { getAllStudent, getAllInstructor, updateUser };
exports.default = UserService;
