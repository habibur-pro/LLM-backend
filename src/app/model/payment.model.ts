import { Document, Model, Schema, model } from 'mongoose'
import { IPayment } from '../interface/payment.interface'
import { PaymentStatus } from '../enum'
import idGenerator from '../helpers/idGenerator'

const PaymentSchema = new Schema<IPayment>(
    {
        id: { type: String, required: [true, 'id is required'], unique: true },
        amount: { type: Number, required: [true, 'amount is required'] },
        status: {
            type: String,
            enum: Object.values(PaymentStatus),
            default: PaymentStatus.PENDING,
        },
        gateway: {
            type: String,
            required: [true, 'payment gateway is required'],
        },
        transactionId: { type: String },
        user: { type: Schema.Types.ObjectId, ref: 'user' },
        order: { type: Schema.Types.ObjectId, ref: 'order' },
    },
    { timestamps: true }
)

PaymentSchema.pre<IPayment>('validate', async function (next) {
    if (!this.id) {
        this.id = await idGenerator(
            this.constructor as Model<Document & IPayment>
        )
    }
    next()
})

const Payment = model<IPayment>('payment', PaymentSchema)
export default Payment
