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
exports.getLecturesWithFilters = void 0;
const ApiError_1 = __importDefault(require("../helpers/ApiError"));
const lecture_model_1 = __importDefault(require("../model/lecture.model"));
const http_status_1 = __importDefault(require("http-status"));
const mongoose_1 = __importDefault(require("mongoose"));
const module_model_1 = __importDefault(require("../model/module.model"));
const getErrorMessage_1 = require("../helpers/getErrorMessage");
const course_model_1 = __importDefault(require("../model/course.model"));
const enum_1 = require("../enum");
const updateLecture = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.lectureId;
    const payload = req.body;
    const { video } = (req === null || req === void 0 ? void 0 : req.uploadedFiles) || {};
    const lecture = yield lecture_model_1.default.findOne({ id });
    if (!lecture) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'lecture not found');
    }
    if (video) {
        payload.content = video === null || video === void 0 ? void 0 : video.url;
    }
    yield lecture_model_1.default.findOneAndUpdate({ id }, payload, { new: true });
    return { message: 'lecture updated' };
});
const deleteLecture = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        // module have one to many relation like lectures []. i have to remove id from lectures relations
        const lectureId = req.params.lectureId;
        const moduleId = req.query.module;
        // find module
        const module = yield module_model_1.default.findOne({ id: moduleId }).session(session);
        if (!module)
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'module not found');
        // find lecture
        const lecture = yield lecture_model_1.default.findOne({ id: lectureId }).session(session);
        if (!lecture)
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'lecture not found');
        // delete lecture
        yield lecture_model_1.default.findOneAndDelete({ id: lecture.id }).session(session);
        // remove reference from modules.lectures
        yield module_model_1.default.findOneAndUpdate({ id: module.id }, { $pull: { lectures: lecture._id } }, //  pull lecture ObjectId
        { new: true, session });
        yield session.commitTransaction();
    }
    catch (error) {
        yield session.abortTransaction();
        console.log('error', error);
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, (0, getErrorMessage_1.getErrorMessage)(error));
    }
    finally {
        session.endSession();
    }
});
const getLecturesWithFilters = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseId, moduleId } = req.query;
        console.log('courseId:', courseId, 'moduleId:', moduleId);
        // --- Step 1: Always send filters
        const courses = yield course_model_1.default.find().select('_id title').lean();
        const modules = yield module_model_1.default.find()
            .select('_id title courseId lectures')
            .lean();
        const lectureTypes = Object.values(enum_1.LectureContentType);
        // --- Step 2: Determine which module IDs to fetch lectures from
        let targetModuleIds = [];
        if (moduleId && mongoose_1.default.Types.ObjectId.isValid(moduleId.toString())) {
            targetModuleIds = [new mongoose_1.default.Types.ObjectId(moduleId.toString())];
        }
        else if (courseId &&
            mongoose_1.default.Types.ObjectId.isValid(courseId.toString())) {
            const course = yield course_model_1.default.findById(courseId)
                .select('modules')
                .lean();
            if (!course)
                throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Course not found');
            targetModuleIds = course.modules;
        }
        else {
            targetModuleIds = modules.map((m) => m._id);
        }
        // --- Step 3: Fetch lectures from modules
        const modulesWithLectures = modules.filter((m) => targetModuleIds.includes(m._id));
        const lectureIds = modulesWithLectures.flatMap((m) => m.lectures);
        const lectures = lectureIds.length
            ? yield lecture_model_1.default.find({ _id: { $in: lectureIds } }).lean()
            : [];
        // --- Step 4: Attach module & course info to each lecture
        const lecturesWithInfo = lectures.map((lec) => {
            const module = modules.find((m) => m.lectures.includes(lec._id));
            const course = module
                ? courses.find((c) => { var _a; return c._id.toString() === ((_a = module.courseId) === null || _a === void 0 ? void 0 : _a.toString()); })
                : null;
            return Object.assign(Object.assign({}, lec), { module: module
                    ? { _id: module._id, title: module.title }
                    : null, course: course
                    ? { _id: course._id, title: course.title }
                    : null });
        });
        // --- Step 5: Return response
        const responseData = {
            filters: { courses, modules, lectureTypes },
            data: lecturesWithInfo,
        };
        return responseData;
    }
    catch (error) {
        console.error(error);
        // return res.status(400).json({
        //     success: false,
        //     message: 'Failed to fetch lectures',
        //     errorMessages: [{ path: '', message: error.message }],
        // })
    }
});
exports.getLecturesWithFilters = getLecturesWithFilters;
const LectureService = { updateLecture, deleteLecture, getLecturesWithFilters: exports.getLecturesWithFilters };
exports.default = LectureService;
