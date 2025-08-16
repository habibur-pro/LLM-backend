import { z } from 'zod'
export const signUpValidationSchema = z.object({
    fullName: z.string().nonempty('fullName is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    otpCode: z.string().nonempty('OTP code is required'),
    otpExpiresAt: z.instanceof(Date).optional(),
})
