import { Document, Model, Schema, Types, model } from 'mongoose'
import idGenerator from '../helpers/idGenerator'
import { ICourse } from '../interface/course.interface'
import { CourseStatus } from '../enum'
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
        discountedPrice: {
            type: Number,
            default: 0,
        },

        description: {
            type: String,
            required: [true, 'description is required'],
        },
        thumbnail: {
            type: String,
            required: [true, 'thumbnail is required'],
        },
        coverPhoto: {
            type: String,
            required: [true, 'coverPhoto is required'],
        },
        duration: {
            type: Number,
            required: [true, 'duration is required'], //in minutes
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

        tags: {
            type: [String],
            default: null,
        },
        learningPoints: {
            type: [String],
            default: null,
        },
        requirements: {
            type: [String],
            default: null,
        },
        instructor: {
            type: Schema.Types.ObjectId,
            ref: 'user',
            default: null,
        },

        status: {
            type: String,
            enum: Object.values(CourseStatus),
            default: CourseStatus.UPCOMING,
        },

        modules: {
            type: [Schema.Types.ObjectId],
            default: null,
            ref: 'module',
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
