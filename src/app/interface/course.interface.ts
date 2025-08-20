import { Types } from 'mongoose'
import { CourseStatus } from '../enum'

export interface ICourse {
    id: string
    title: string
    slug: string
    price: number
    discountedPrice: number
    description: string
    thumbnail: string
    coverPhoto: string
    duration: number
    totalSeat: number
    availableSeat: number
    modules: Array<Types.ObjectId>
    tags: string[]
    learningPoints: string[]
    requirements: string[]
    faqs: { question: string; answer: string }[]
    instructor: Types.ObjectId
    status: CourseStatus
    createdAt: Date
    updatedAt: Date
}

interface ILecturePayload {
    title: string
    content: string
    contentType: string
}

interface IModulePayload {
    title: string
    lectures: ILecturePayload[]
}

export interface IAddCoursePayload extends Partial<Omit<ICourse, 'modules'>> {
    modules?: IModulePayload[]
}
