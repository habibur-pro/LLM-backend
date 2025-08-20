"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
// interface IWatchedLecture {
//     lectureId: string // FK → Lecture.id
//     watchedAt: Date
// }
// interface IModuleProgress {
//     moduleId: string // FK → Module.id
//     lecturesWatched: IWatchedLecture[] // Array of watched lectures
//     isCompleted: boolean
//     completedAt?: Date
// }
// export interface IUserCourseProgress extends Document {
//     userId: string // FK → User.id
//     courseId: string // FK → Course.id
//     modules: IModuleProgress[]
//     overallProgress: number // %
//     isCompleted: boolean
//     completedAt?: Date
// }
const WatchedLectureSchema = new mongoose_1.Schema({
    lecture: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: [true, 'lectured is required'],
    },
    watchedAt: { type: Date, default: Date.now },
});
const ModuleProgressSchema = new mongoose_1.Schema({
    module: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: [true, 'module is required'],
    },
    lecturesWatched: { type: [WatchedLectureSchema], default: [] },
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
});
const UserCourseProgressSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: [true, 'userId is required'],
    },
    course: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: [true, 'course is required'],
    },
    modules: { type: [ModuleProgressSchema], default: [] },
    overallProgress: { type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
}, { timestamps: true });
const UserCourseProgress = (0, mongoose_1.model)('userCourseProgress', UserCourseProgressSchema);
exports.default = UserCourseProgress;
