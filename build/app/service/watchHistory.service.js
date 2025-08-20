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
const ApiError_1 = __importDefault(require("../helpers/ApiError"));
const course_model_1 = __importDefault(require("../model/course.model"));
const http_status_1 = __importDefault(require("http-status"));
const user_model_1 = __importDefault(require("../model/user.model"));
const watchHistory_interface_1 = require("../model/watchHistory.interface");
const module_model_1 = __importDefault(require("../model/module.model"));
const lecture_model_1 = __importDefault(require("../model/lecture.model"));
const createWatchHistory = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const course = yield course_model_1.default.findOne({ id: payload.courseId });
    if (!course) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'course not found');
    }
    const user = yield user_model_1.default.findOne({ id: payload.userId });
    if (!user) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'user not found');
    }
    const watchHistory = yield watchHistory_interface_1.WatchHistory.findOne({
        courseId: payload.courseId,
        userId: payload.userId,
    });
    if (watchHistory) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'history already exist');
    }
    yield watchHistory_interface_1.WatchHistory.create(Object.assign(Object.assign({}, payload), { user: user._id, course: course._id }));
    return { message: 'created' };
});
const nextLecture = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const history = yield watchHistory_interface_1.WatchHistory.findOne({ id: payload.historyId });
    if (!history) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'history not found');
    }
    const module = yield module_model_1.default.findOne({ id: payload.moduleId });
    if (!module) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'course not found');
    }
    const lecture = yield lecture_model_1.default.findOne({ id: payload.lectureId });
    if (!lecture) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'user not found');
    }
    const totalLectures = (_a = module.lectures) === null || _a === void 0 ? void 0 : _a.length;
    if (lecture.lectureNumber === totalLectures) {
        // move to next module
    }
    const watchedModule = history.modulesProgress.find((item) => item.module === module._id);
    yield watchHistory_interface_1.WatchHistory.findOneAndUpdate({ id: history.id }, {}, { new: true });
});
const WatchHistoryService = { createWatchHistory };
exports.default = WatchHistoryService;
