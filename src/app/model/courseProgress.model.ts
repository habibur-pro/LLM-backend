import { Schema, model, Document, Types } from 'mongoose'
import {
    IModuleProgress,
    IUserCourseProgress,
    IWatchedLecture,
} from '../interface/courseProgress.interface'

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

const WatchedLectureSchema = new Schema<IWatchedLecture>({
    lecture: {
        type: Schema.Types.ObjectId,
        required: [true, 'lectured is required'],
    },
    watchedAt: { type: Date, default: Date.now },
})

const ModuleProgressSchema = new Schema<IModuleProgress>({
    module: {
        type: Schema.Types.ObjectId,
        required: [true, 'module is required'],
    },
    lecturesWatched: { type: [WatchedLectureSchema], default: [] },
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
})

const UserCourseProgressSchema = new Schema<IUserCourseProgress>(
    {
        user: {
            type: Schema.Types.ObjectId,
            required: [true, 'userId is required'],
        },
        course: {
            type: Schema.Types.ObjectId,
            required: [true, 'course is required'],
        },
        modules: { type: [ModuleProgressSchema], default: [] },
        overallProgress: { type: Number, default: 0 },
        isCompleted: { type: Boolean, default: false },
        completedAt: { type: Date, default: null },
    },
    { timestamps: true }
)

const UserCourseProgress = model<IUserCourseProgress>(
    'userCourseProgress',
    UserCourseProgressSchema
)

export default UserCourseProgress
