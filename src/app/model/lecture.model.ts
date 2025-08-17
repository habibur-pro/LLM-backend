import { Document, Model, Schema, Types, model } from 'mongoose'
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

        moduleId: {
            type: String,
            required: [true, 'moduleId is required'],
        },

        content: {
            type: String,
            required: [true, 'content is required'],
        },
        contentType: {
            type: String,
            enum: Object.values(LectureContentType),
            required: [true, 'content type is required'],
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
const Lecture = model<ILecture>('lecture', LectureSchema)
export default Lecture
