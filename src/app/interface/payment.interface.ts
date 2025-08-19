import { Types } from 'mongoose'
import { PaymentStatus } from '../enum'

export interface IPayment {
    id: string
    amount: number
    status: PaymentStatus
    gateway: string
    transactionId: string
    user: Types.ObjectId // ObjectId (User)
    order: Types.ObjectId // ObjectId (Order)
    createdAt: Date
    updatedAt: Date
}
