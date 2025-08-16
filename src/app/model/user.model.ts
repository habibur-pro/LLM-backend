import { Document, Model, Schema, model } from 'mongoose'
import { IUser } from '../interface/user.interface'
import idGenerator from '../helpers/idGenerator'
import { UserRole } from '../enum'

const UserSchema = new Schema<IUser>(
    {
        id: {
            type: String,
            required: [true, 'id is required'],
            unique: true,
        },
        name: {
            type: String,
            unique: true,
            required: [true, 'full name is required'],
        },
        email: {
            type: String,
            required: [true, 'email is required'],
            unique: true,
        },
        phone: {
            type: String,
            required: [true, 'phone is required'],
            unique: true,
        },
        password: {
            type: String,
            required: [true, 'phone is required'],
            minlength: 6,
        },
        role: {
            type: String,
            enum: Object.values(UserRole),
            default: UserRole.Student,
        },
    },
    { timestamps: true }
)
UserSchema.pre<IUser>('validate', async function (next) {
    if (!this.id) {
        this.id = await idGenerator(this.constructor as Model<Document & IUser>)
    }
    next()
})
const User = model<IUser>('user', UserSchema)
export default User
