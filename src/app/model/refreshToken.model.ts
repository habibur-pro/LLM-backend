import { model, Schema } from 'mongoose'
import { IRefreshToken } from '../interface/refreshToken.interface'

const RefreshTokenSchema = new Schema<IRefreshToken>({
    token: {
        type: String,
        required: [true, 'token is required'],
        unique: true,
    },
    userId: {
        type: String,
        required: [true, 'token is required'],
    },
    expiresAt: {
        type: Date,
        required: [true, 'expiresAt is required'],
    },
})

const RefreshToken = model<IRefreshToken>('refresh-token', RefreshTokenSchema)
export default RefreshToken
