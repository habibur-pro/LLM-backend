import { model, Schema } from 'mongoose'
import {
    IModuleProgress,
    IWatchedLecture,
    IWatchHistory,
} from '../interface/watchHistory.interface'

const WatchedLectureSchema = new Schema<IWatchedLecture>(
    {
        lecture: {
            type: Schema.Types.ObjectId,
            ref: 'lecture',
            required: [true, 'Lecture ID is required'],
        },
        watchedAt: { type: Date, default: Date.now },
    },
    { _id: false }
)

const ModuleProgressSchema = new Schema<IModuleProgress>(
    {
        module: {
            type: Schema.Types.ObjectId,
            ref: 'module',
            required: [true, 'Module ID is required'],
        },
        lecturesWatched: { type: [WatchedLectureSchema], default: [] },
        isCompleted: { type: Boolean, default: false },
        isLocked: { type: Boolean, default: false },
        completedAt: { type: Date, default: null },
    },
    { _id: false }
)

const WatchHistorySchema = new Schema<IWatchHistory>(
    {
        id: {
            type: String,
            uni: true,
        },
        userId: {
            type: String,
            required: [true, 'User ID is required'],
        },
        user: {
            type: Schema.Types.ObjectId,
            required: [true, 'User ID is required'],
            ref: 'user',
        },
        courseId: { type: String, required: [true, 'Course ID is required'] },
        course: {
            type: Schema.Types.ObjectId,
            required: [true, 'Course reference is required'],
            ref: 'course',
        },
        modulesProgress: { type: [ModuleProgressSchema], default: [] },
        totalProgress: { type: Number, default: 0 },
        isCompleted: { type: Boolean, default: false },
    },
    { timestamps: true }
)

export const WatchHistory = model<IWatchHistory>(
    'watchHistory',
    WatchHistorySchema
)
