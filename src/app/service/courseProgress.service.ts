import httpStatus from 'http-status'
import mongoose from 'mongoose'
import Course from '../model/course.model'
import ApiError from '../helpers/ApiError'
import User from '../model/user.model'
import MyClass from '../model/myClass.model'
const startCourse = async (payload: { userId: string; courseId: string }) => {
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        const user = await User.findOne({ id: payload.userId })
        if (!user) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'user not found')
        }
        const course = await Course.findOne({ id: payload.courseId })
        if (!course) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'course not found')
        }

        await MyClass.create()
    } catch (error) {}
}

const getMyCourse = async () => {}

const CourseProgressService = { startCourse }
export default CourseProgressService
