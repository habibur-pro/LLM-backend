import { Request } from 'express'
import { UserRole } from '../enum'
import ApiError from '../helpers/ApiError'
import { IUser } from '../interface/user.interface'
import User from '../model/user.model'
import httpStatus from 'http-status'
const getAllStudent = async () => {
    return await User.find({ role: UserRole.Student })
        .sort({ createdAt: -1 })
        .exec()
}
const getAllInstructor = async () => {
    return await User.find({ role: UserRole.instructor }).exec()
}

const updateUser = async (req: Request) => {
    const userId = req.params.userId
    const payload: Partial<IUser> = req.body
    const user = await User.findOneAndUpdate({ id: userId })
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'user not round')
    }
    // If trying to change role, ensure requester is Admin
    if (payload.role && (!req.user || req.user.role !== UserRole.Admin)) {
        throw new ApiError(
            httpStatus.UNAUTHORIZED,
            'You have no permission to change role'
        )
    }
    await User.findOneAndUpdate({ id: userId }, payload, { new: true })
    return { message: 'user updated' }
}

const UserService = { getAllStudent, getAllInstructor, updateUser }
export default UserService
