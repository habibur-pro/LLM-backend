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
const mongoose_1 = require("mongoose");
const idGenerator_1 = __importDefault(require("../helpers/idGenerator"));
const lecture = new mongoose_1.Schema({
    lecture: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: [true, 'lectured is required'],
    },
    watchedAt: { type: Date, default: Date.now },
});
const ModuleSchema = new mongoose_1.Schema({
    module: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: [true, 'module is required'],
    },
    lectures: { type: [lecture], default: [] },
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
});
const MyClassSchema = new mongoose_1.Schema({
    id: {
        type: String,
        unique: true,
        required: [true, 'id is required'],
    },
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: [true, 'userId is required'],
    },
    course: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: [true, 'course is required'],
        ref: 'course',
    },
    modules: { type: [ModuleSchema], default: [] },
    overallProgress: { type: Number, default: 0 },
    currentLecture: {
        type: mongoose_1.Schema.Types.ObjectId,
        require: [true, 'current lecture is required'],
        ref: 'lecture',
    },
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
}, { timestamps: true });
MyClassSchema.pre('validate', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.id) {
            this.id = yield (0, idGenerator_1.default)(this.constructor);
        }
        next();
    });
});
const MyClass = (0, mongoose_1.model)('myClass', MyClassSchema);
exports.default = MyClass;
