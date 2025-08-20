import {
    Document,
    HydratedDocument,
    Model,
    Schema,
    Types,
    model,
} from 'mongoose'
import idGenerator from '../helpers/idGenerator'
import { ICourse } from '../interface/course.interface'
import { IModule } from '../interface/module.interface'

const ModuleSchema = new Schema<IModule>(
    {
        id: {
            type: String,
            required: [true, 'id is required'],
            unique: true,
        },
        title: {
            type: String,
            required: [true, 'title is required'],
        },

        moduleNumber: {
            type: Number,
            // required: [true, 'moduleNumber is required'],
            default: 0,
        },
        lectures: {
            type: [Schema.Types.ObjectId],
            ref: 'lecture',
            default: [],
        },
        isFree: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
)
ModuleSchema.pre<IModule>('validate', async function (next) {
    if (!this.id) {
        this.id = await idGenerator(
            this.constructor as Model<Document & IModule>
        )
    }
    next()
})

// Auto-increment moduleNumber based on courseId
type ModuleDoc = HydratedDocument<IModule>
ModuleSchema.pre<ModuleDoc>('save', async function (next) {
    if (this.isNew) {
        const ModuleModel = this.constructor as Model<IModule>
        const lastModule = await ModuleModel.findOne({
            courseId: this.courseId,
        })
            .sort({ moduleNumber: -1 })
            .lean()

        this.moduleNumber = lastModule ? lastModule.moduleNumber + 1 : 1
    }
    next()
})

const Module = model<IModule>('module', ModuleSchema)
export default Module
