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
const course_model_1 = __importDefault(require("../model/course.model"));
const ApiError_1 = __importDefault(require("../helpers/ApiError"));
const module_model_1 = __importDefault(require("../model/module.model"));
const lecture_model_1 = __importDefault(require("../model/lecture.model"));
const getErrorMessage_1 = require("../helpers/getErrorMessage");
const mongoose_1 = __importDefault(require("mongoose"));
const updateModule = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const module = yield module_model_1.default.findOne({ id });
    if (!module) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'module not found');
    }
    delete payload.id;
    delete payload.lectures;
    yield module_model_1.default.findOneAndUpdate({ id }, payload, { new: true });
    return { message: 'updated' };
});
const addLecture = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const module = yield module_model_1.default.findOne({ id });
    if (!module) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'module not found');
    }
    const newLecture = yield lecture_model_1.default.create(Object.assign(Object.assign({}, payload), { moduleId: id }));
    yield module_model_1.default.findOneAndUpdate({ id }, { $push: { lectures: newLecture._id } }, { new: true });
    return { message: 'lecture added' };
});
const deleteModule = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        // course have one to many relation like modules []. i have to remove id from modules relations
        const moduleId = req.params.moduleId;
        const courseId = req.query.course;
        // find course
        const course = yield course_model_1.default.findOne({ id: courseId }).session(session);
        if (!course)
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'course not found');
        // find module
        const module = yield module_model_1.default.findOne({ id: moduleId }).session(session);
        if (!module)
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'module not found');
        console.log('module', module);
        // delete all lectures in module. lectures array stores ObjectId
        if (module.lectures.length > 0) {
            yield lecture_model_1.default.deleteMany({ _id: { $in: module.lectures } }).session(session);
        }
        yield module_model_1.default.findOneAndDelete({ id: module.id }).session(session);
        // remove reference from course.modules
        yield course_model_1.default.findOneAndUpdate({ id: course.id }, { $pull: { modules: module._id } }, // ✅ pull module ObjectId
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
const ModuleService = {
    updateModule,
    addLecture,
    deleteModule,
};
exports.default = ModuleService;
