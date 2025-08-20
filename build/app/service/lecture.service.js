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
const LectureService = { updateLecture };
exports.default = LectureService;
