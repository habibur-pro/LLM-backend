"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WatchHistory = void 0;
const mongoose_1 = require("mongoose");
const WatchedLectureSchema = new mongoose_1.Schema({
    lecture: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'lecture',
        required: [true, 'Lecture ID is required'],
    },
    watchedAt: { type: Date, default: Date.now },
}, { _id: false });
const ModuleProgressSchema = new mongoose_1.Schema({
    module: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'module',
        required: [true, 'Module ID is required'],
    },
    lecturesWatched: { type: [WatchedLectureSchema], default: [] },
    isCompleted: { type: Boolean, default: false },
    isLocked: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
}, { _id: false });
const WatchHistorySchema = new mongoose_1.Schema({
    id: {
        type: String,
        uni: true,
    },
    userId: {
        type: String,
        required: [true, 'User ID is required'],
    },
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: [true, 'User ID is required'],
        ref: 'user',
    },
    courseId: { type: String, required: [true, 'Course ID is required'] },
    course: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: [true, 'Course reference is required'],
        ref: 'course',
    },
    modulesProgress: { type: [ModuleProgressSchema], default: [] },
    totalProgress: { type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false },
}, { timestamps: true });
exports.WatchHistory = (0, mongoose_1.model)('watchHistory', WatchHistorySchema);
