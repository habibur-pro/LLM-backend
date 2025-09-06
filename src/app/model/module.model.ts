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

const Module = model<IModule>('module', ModuleSchema)
export default Module
