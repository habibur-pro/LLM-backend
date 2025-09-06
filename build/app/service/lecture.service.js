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
        const { courseId, moduleId, searchTerm } = req.query;
        const lectureQuery = {};
        // Step 1: Filter lectures by module or course
        if (moduleId && mongoose_1.default.Types.ObjectId.isValid(moduleId.toString())) {
            const module = yield module_model_1.default.findById(moduleId)
                .select('lectures')
                .lean();
            if (module) {
                lectureQuery._id = { $in: module.lectures };
            }
        }
        else if (courseId &&
            mongoose_1.default.Types.ObjectId.isValid(courseId.toString())) {
            const course = yield course_model_1.default.findById(courseId)
                .select('modules')
                .lean();
            if (course) {
                const modulesInCourse = yield module_model_1.default.find({
                    _id: { $in: course.modules },
                })
                    .select('lectures')
                    .lean();
                const lectureIds = modulesInCourse.flatMap((m) => m.lectures);
                lectureQuery._id = { $in: lectureIds };
            }
        }
        // Step 2: Search term
        if (searchTerm &&
            typeof searchTerm === 'string' &&
            searchTerm.trim() !== '') {
            const searchRegex = new RegExp(searchTerm, 'i');
            lectureQuery.title = { $regex: searchRegex };
        }
        // Step 3: Fetch lectures
        const lectures = yield lecture_model_1.default.find(lectureQuery).lean();
        // Step 4: Fetch all courses + modules
        const courses = yield course_model_1.default.find().select('_id title modules').lean();
        const modules = yield module_model_1.default.find().select('_id title lectures').lean();
        // Step 5: Attach module + course info
        const lecturesWithInfo = lectures.map((lec) => {
            const module = modules.find((m) => { var _a; return (_a = m.lectures) === null || _a === void 0 ? void 0 : _a.some((lId) => lId.equals(lec._id)); });
            let course = null;
            if (module) {
                course = courses.find((c) => { var _a; return (_a = c.modules) === null || _a === void 0 ? void 0 : _a.some((modId) => modId.equals(module._id)); });
            }
            return Object.assign(Object.assign({}, lec), { module: module
                    ? { _id: module._id, title: module.title }
                    : null, course: course
                    ? { _id: course._id, title: course.title }
                    : null });
        });
        // Step 6: Modules filter list (scoped by course if provided)
        let modulesForFilter = modules;
        if (courseId && mongoose_1.default.Types.ObjectId.isValid(courseId.toString())) {
            const course = courses.find((c) => c._id.toString() === courseId.toString());
            if (course) {
                modulesForFilter = modules.filter((m) => { var _a; return (_a = course.modules) === null || _a === void 0 ? void 0 : _a.some((modId) => modId.equals(m._id)); });
            }
        }
        // Step 7: Response
        const lectureTypes = Object.values(enum_1.LectureContentType);
        const responseData = {
            filters: {
                courses: courses.map((c) => ({ _id: c._id, title: c.title })),
                modules: modulesForFilter.map((m) => ({
                    _id: m._id,
                    title: m.title,
                })),
                lectureTypes,
            },
            data: lecturesWithInfo,
        };
        return responseData;
    }
    catch (error) {
        console.error('Error fetching lectures:', error);
        res.status(http_status_1.default.BAD_REQUEST).json({
            success: false,
            message: 'Failed to fetch lectures',
            errorMessages: [{ path: '', message: error.message }],
        });
    }
});
const LectureService = { updateLecture, deleteLecture, getLecturesWithFilters };
exports.default = LectureService;
