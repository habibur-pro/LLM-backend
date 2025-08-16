import { UserRole } from '../enum'

export interface IUser {
    id: string
    name: string
    email: string
    phone: string
    password: string
    role: UserRole
    createdAt: Date
    updatedAt: Date
}
