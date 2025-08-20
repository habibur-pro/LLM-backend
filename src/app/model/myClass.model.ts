import { Schema, model, Document, Types, Model } from 'mongoose'
import {
    ICompletedModules,
    IMyClass,
    IWatchedLecture,
} from '../interface/myClass.interface'
import idGenerator from '../helpers/idGenerator'

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

const ModuleProgressSchema = new Schema<ICompletedModules>({
    module: {
        type: Schema.Types.ObjectId,
        required: [true, 'module is required'],
    },
    lecturesWatched: { type: [WatchedLectureSchema], default: [] },
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
})

const MyClassSchema = new Schema<IMyClass>(
    {
        id: {
            type: String,
            unique: true,
            required: [true, 'id is required'],
        },
        user: {
            type: Schema.Types.ObjectId,
            required: [true, 'userId is required'],
        },
        course: {
            type: Schema.Types.ObjectId,
            required: [true, 'course is required'],
            ref: 'course',
        },
        completedModules: { type: [ModuleProgressSchema], default: [] },
        overallProgress: { type: Number, default: 0 },
        prevLecture: {
            type: Schema.Types.ObjectId,
            require: [true, 'current lecture is required'],
            ref: 'lecture',
        },
        currentLecture: {
            type: Schema.Types.ObjectId,
            require: [true, 'current lecture is required'],
            ref: 'lecture',
        },

        isCompleted: { type: Boolean, default: false },
        completedAt: { type: Date, default: null },
    },
    { timestamps: true }
)
MyClassSchema.pre<IMyClass>('validate', async function (next) {
    if (!this.id) {
        this.id = await idGenerator(
            this.constructor as Model<Document & IMyClass>
        )
    }
    next()
})
const MyClass = model<IMyClass>('myClass', MyClassSchema)

export default MyClass
