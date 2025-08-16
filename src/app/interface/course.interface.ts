import { Types } from 'mongoose'

export interface ICourse {
    id: string
    title: string
    slug: string
    price: number
    description: string
    thumbnail: string
    totalSeat: number
    availableSeat: number
    modules: Array<Types.ObjectId>
    isPublished: boolean
    createdAt: Date
    updatedAt: Date
}
