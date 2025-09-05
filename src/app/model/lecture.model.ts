import { Document, HydratedDocument, Model, Schema, model } from 'mongoose'
import idGenerator from '../helpers/idGenerator'
import { ILecture } from '../interface/lecture.interface'
import { LectureContentType } from '../enum'

const LectureSchema = new Schema<ILecture>(
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
        // moduleId: {
        //     type: String,
        //     required: [true, 'moduleId is required'],
        // },
        content: {
            type: String,
            required: [true, 'content is required'],
        },
        contentType: {
            type: String,
            enum: Object.values(LectureContentType),
            required: [true, 'content type is required'],
        },
        notes: {
            type: [String],
            default: null,
        },
        lectureNumber: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
)

LectureSchema.pre<ILecture>('validate', async function (next) {
    if (!this.id) {
        this.id = await idGenerator(
            this.constructor as Model<Document & ILecture>
        )
    }
    next()
})

type LectureDoc = HydratedDocument<ILecture>

LectureSchema.pre<LectureDoc>('save', async function (next) {
    if (this.isNew) {
        const LectureModel = this.constructor as Model<ILecture>
        const lastLecture = await LectureModel.findOne({
            moduleId: this.moduleId,
        })
            .sort({ lectureNumber: -1 })
            .lean()

        this.lectureNumber = lastLecture ? lastLecture.lectureNumber + 1 : 1
    }
    next()
})

const Lecture = model<ILecture>('lecture', LectureSchema)
export default Lecture
