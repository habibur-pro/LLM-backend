import { Types } from 'mongoose'
import { OrderStatus } from '../../enum'

export interface IOrder {
    id: string
    amount: number
    status: OrderStatus
    payment: Types.ObjectId // ObjectId (Payment)
    user: Types.ObjectId // ObjectId (User)
    course: Types.ObjectId // ObjectId[] (Course)
    createdAt: Date
    updatedAt: Date
}
