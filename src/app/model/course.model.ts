import { Document, Model, Schema, Types, model } from 'mongoose'
import idGenerator from '../helpers/idGenerator'
import { ICourse } from '../interface/course.interface'

const CourseSchema = new Schema<ICourse>(
    {
        id: {
            type: String,
            required: [true, 'id is required'],
            unique: true,
        },
        slug: {
            type: String,
            required: [true, 'id is required'],
            unique: true,
        },
        title: {
            type: String,
            required: [true, 'title is required'],
        },
        price: {
            type: Number,
            required: [true, 'price is required'],
        },

        description: {
            type: String,
            required: [true, 'description is required'],
        },
        thumbnail: {
            type: String,
            required: [true, 'thumbnail is required'],
        },
        totalSeat: {
            type: Number,
            required: [true, 'totalSeat is required'],
            default: 0,
        },
        availableSeat: {
            type: Number,
            required: [true, 'availableSeat is required'],
            default: 0,
        },

        modules: {
            type: [Schema.Types.ObjectId],
            default: [],
            ref: 'module',
        },
        isPublished: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
)
CourseSchema.pre<ICourse>('validate', async function (next) {
    if (!this.id) {
        this.id = await idGenerator(
            this.constructor as Model<Document & ICourse>
        )
    }
    next()
})
const Course = model<ICourse>('course', CourseSchema)
export default Course
