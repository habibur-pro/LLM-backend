import { Schema, model, Document, Types, Model } from 'mongoose'
import {
    ICompletedModules,
    IMyClass,
    IWatchedLecture,
} from '../interface/myClass.interface'
import idGenerator from '../helpers/idGenerator'

const lecture = new Schema<IWatchedLecture>({
    lecture: {
        type: Schema.Types.ObjectId,
        required: [true, 'lectured is required'],
    },
    watchedAt: { type: Date, default: Date.now },
})

const ModuleSchema = new Schema<ICompletedModules>({
    module: {
        type: Schema.Types.ObjectId,
        required: [true, 'module is required'],
    },
    lectures: { type: [lecture], default: [] },
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
        modules: { type: [ModuleSchema], default: [] },
        overallProgress: { type: Number, default: 0 },
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
