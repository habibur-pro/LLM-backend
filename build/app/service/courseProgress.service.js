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
const mongoose_1 = __importDefault(require("mongoose"));
const course_model_1 = __importDefault(require("../model/course.model"));
const ApiError_1 = __importDefault(require("../helpers/ApiError"));
const user_model_1 = __importDefault(require("../model/user.model"));
const myClass_model_1 = __importDefault(require("../model/myClass.model"));
const startCourse = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const user = yield user_model_1.default.findOne({ id: payload.userId });
        if (!user) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'user not found');
        }
        const course = yield course_model_1.default.findOne({ id: payload.courseId });
        if (!course) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'course not found');
        }
        yield myClass_model_1.default.create();
    }
    catch (error) { }
});
const getMyCourse = () => __awaiter(void 0, void 0, void 0, function* () { });
const CourseProgressService = { startCourse };
exports.default = CourseProgressService;
