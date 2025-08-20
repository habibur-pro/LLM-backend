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
const ApiError_1 = __importDefault(require("../helpers/ApiError"));
const module_model_1 = __importDefault(require("../model/module.model"));
const lecture_model_1 = __importDefault(require("../model/lecture.model"));
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
    yield module_model_1.default.findOneAndUpdate({ id }, { $push: { lectures: newLecture._id } }, { new: true });
    return { message: 'lecture added' };
});
const ModuleService = {
    updateModule,
    addLecture,
};
exports.default = ModuleService;
