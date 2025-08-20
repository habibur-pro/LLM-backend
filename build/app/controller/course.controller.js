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
const course_service_1 = __importDefault(require("../service/course.service"));
const addCourse = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield course_service_1.default.addCourse(req);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'course added successfully',
        data: result,
    });
}));
const getCourseBySlugAndId = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const identifier = req.params.slugOrId;
    const result = yield course_service_1.default.getCourseBySlugAndId(identifier);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'course fetched successfully',
        data: result,
    });
}));
const updateCourse = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield course_service_1.default.updateCourse(req);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'course updated successfully',
        data: result,
    });
}));
const getAllCourse = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield course_service_1.default.getAllCourse();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'courses fetched successfully',
        data: result,
    });
}));
const getModuleOfCourse = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const identifier = req.params.slugOrId;
    const result = yield course_service_1.default.getModuleOfCourse(identifier);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'courses fetched successfully',
        data: result,
    });
}));
const addCourseModule = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const identifier = req.params.slugOrId;
    const result = yield course_service_1.default.addModule(identifier, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'module added successfully',
        data: result,
    });
}));
const CourseController = {
    addCourse,
    getCourseBySlugAndId,
    updateCourse,
    getAllCourse,
    getModuleOfCourse,
    addCourseModule,
};
exports.default = CourseController;
