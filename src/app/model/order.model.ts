import { Document, Model, Schema, model } from 'mongoose'
import { IOrder } from '../interface/order.interface'
import { OrderStatus } from '../enum'
import idGenerator from '../helpers/idGenerator'

const OrderSchema = new Schema<IOrder>(
    {
        id: { type: String, required: [true, 'id is required'], unique: true },
        amount: { type: Number, required: [true, 'amount is required'] },
        status: {
            type: String,
            enum: Object.values(OrderStatus),
            default: OrderStatus.PENDING,
        },
        payment: { type: Schema.Types.ObjectId, ref: 'payment', default: null },
        user: { type: Schema.Types.ObjectId, ref: 'user' },
        course: { type: Schema.Types.ObjectId, ref: 'course' },
    },
    { timestamps: true }
)

OrderSchema.pre<IOrder>('validate', async function (next) {
    if (!this.id) {
        this.id = await idGenerator(
            this.constructor as Model<Document & IOrder>
        )
    }
    next()
})

const Order = model<IOrder>('order', OrderSchema)
export default Order
