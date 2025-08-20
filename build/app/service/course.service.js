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
const slugify_1 = __importDefault(require("slugify"));
const http_status_1 = __importDefault(require("http-status"));
const course_model_1 = __importDefault(require("../model/course.model"));
const ApiError_1 = __importDefault(require("../helpers/ApiError"));
const module_model_1 = __importDefault(require("../model/module.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const getErrorMessage_1 = require("../helpers/getErrorMessage");
const lecture_model_1 = __importDefault(require("../model/lecture.model"));
const addCourse = (req) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { coverPhoto, thumbnail } = (req === null || req === void 0 ? void 0 : req.uploadedFiles) || {};
        const payload = JSON.parse((_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.data);
        if (!coverPhoto || !thumbnail) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'coverPhoto and thumbnail are required');
        }
        const slug = (0, slugify_1.default)(payload.title, {
            lower: true,
            replacement: '-',
            trim: true,
        });
        const course = yield course_model_1.default.findOne({
            $or: [{ title: payload.title }, { slug }],
        }).session(session);
        if (course) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'course already exist by this name');
        }
        const moduleIds = [];
        // Create Modules & Contents if provided
        if ((payload === null || payload === void 0 ? void 0 : payload.modules) && payload.modules.length > 0) {
            for (const mod of payload.modules) {
                const lectureIds = [];
                if (mod.lectures && mod.lectures.length > 0) {
                    for (const lecture of mod.lectures) {
                        const newContent = new lecture_model_1.default(lecture);
                        yield newContent.save({ session });
                        lectureIds.push(newContent._id.toString());
                    }
                }
                console.log('lecture ids', lectureIds);
                const newModule = new module_model_1.default({
                    title: mod.title,
                    lectures: lectureIds,
                });
                yield newModule.save({ session });
                moduleIds.push(newModule === null || newModule === void 0 ? void 0 : newModule._id);
            }
        }
        const courseData = Object.assign(Object.assign({}, payload), { slug, thumbnail: thumbnail === null || thumbnail === void 0 ? void 0 : thumbnail.url, coverPhoto: coverPhoto === null || coverPhoto === void 0 ? void 0 : coverPhoto.url, availableSeat: payload.totalSeat, modules: moduleIds });
        const newCourse = yield course_model_1.default.create([courseData], { session });
        yield session.commitTransaction();
        return { message: 'course created successfully' };
    }
    catch (error) {
        yield session.abortTransaction();
        console.log('error', error);
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, (0, getErrorMessage_1.getErrorMessage)(error));
    }
    finally {
        yield session.endSession();
    }
});
const getAllCourse = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield course_model_1.default.find().populate('modules');
});
const getCourseBySlugAndId = (identifier) => __awaiter(void 0, void 0, void 0, function* () {
    const course = yield course_model_1.default.findOne({
        $or: [{ slug: identifier }, { id: identifier }],
    });
    if (!course) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'course not found');
    }
    return yield course_model_1.default.findOne({
        $or: [{ slug: identifier }, { id: identifier }],
    }).populate({
        path: 'modules',
        populate: {
            path: 'lectures',
            model: 'lecture',
        },
    });
});
const updateCourse = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const identifier = req.params.slugOrId;
    const payload = req.body;
    const { coverPhoto, thumbnail } = (req === null || req === void 0 ? void 0 : req.uploadedFiles) || {};
    const course = yield course_model_1.default.findOne({
        $or: [{ id: identifier }, { slug: identifier }],
    });
    if (!course) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'course not found');
    }
    delete payload.id;
    delete payload.slug;
    if (coverPhoto) {
        payload.coverPhoto = (coverPhoto === null || coverPhoto === void 0 ? void 0 : coverPhoto.url) || course.coverPhoto;
    }
    if (thumbnail) {
        payload.thumbnail = (thumbnail === null || thumbnail === void 0 ? void 0 : thumbnail.url) || course.thumbnail;
    }
    yield course_model_1.default.findOneAndUpdate({
        $or: [{ id: identifier }, { slug: identifier }],
    }, payload, {
        new: true,
    });
    return { message: 'updated' };
});
const getModuleOfCourse = (identifier) => __awaiter(void 0, void 0, void 0, function* () {
    const course = yield course_model_1.default.findOne({
        $or: [{ id: identifier }, { slug: identifier }],
    });
    if (!course) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'course not found');
    }
    const modules = yield module_model_1.default.find({ courseId: course.id }).populate('lectures');
    return modules;
});
const addModule = (identifier, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const course = yield course_model_1.default.findOne({
            $or: [{ id: identifier }, { slug: identifier }],
        }).session(session);
        if (!course) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'course not found');
        }
        const newModule = yield module_model_1.default.create([
            {
                courseId: course.id,
                title: payload.title,
                isFree: (payload === null || payload === void 0 ? void 0 : payload.isFree) || false,
            },
        ], { session });
        yield course_model_1.default.findOneAndUpdate({ id: course === null || course === void 0 ? void 0 : course.id }, { $push: { modules: newModule[0]._id } }, { new: true, session });
        yield session.commitTransaction();
        return { message: 'module created' };
    }
    catch (error) {
        yield session.abortTransaction();
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, (0, getErrorMessage_1.getErrorMessage)(error));
    }
    finally {
        yield session.endSession();
    }
});
const CourseService = {
    addCourse,
    getAllCourse,
    updateCourse,
    getCourseBySlugAndId,
    getModuleOfCourse,
    addModule,
};
exports.default = CourseService;
