import { Types } from 'mongoose'

export interface IModule {
    id: string
    title: string
    courseId: string
    moduleNumber: number
    lectures: Array<Types.ObjectId>
    isFree: boolean
    createdAt: Date
    updatedAt: Date
}
