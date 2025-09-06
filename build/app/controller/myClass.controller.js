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
const asyncHandler_1 = __importDefault(require("../helpers/asyncHandler"));
const sendResponse_1 = __importDefault(require("../helpers/sendResponse"));
const myClass_service_1 = __importDefault(require("../service/myClass.service"));
const getMyClasses = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield myClass_service_1.default.getMyClasses(req);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'my classes  fetched successfully',
        data: data,
    });
}));
const nextLecture = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const classId = req.params.classId;
    const providedLectureId = (_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.lecture;
    console.log('provided', providedLectureId);
    const data = yield myClass_service_1.default.nextLecture(classId, providedLectureId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'move to next lecture successfully',
        data: data,
    });
}));
const previousLecture = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const classId = req.params.classId;
    const data = yield myClass_service_1.default.previousLecture(classId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'move to previous lecture successfully',
        data: data,
    });
}));
const singleClassProgress = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const classId = req.params.classId;
    const data = yield myClass_service_1.default.getSingleClassWithProgress(classId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'single class progress fetched successfully',
        data: data,
    });
}));
const setCurrentLecture = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const classId = req.params.classId;
    const providedLectureId = (_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.lecture;
    const data = yield myClass_service_1.default.setCurrentLecture(classId, providedLectureId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'current lecture updated successfully',
        data: data,
    });
}));
const MyClassController = {
    getMyClasses,
    nextLecture,
    previousLecture,
    singleClassProgress,
    setCurrentLecture,
};
exports.default = MyClassController;
