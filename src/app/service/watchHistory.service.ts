import ApiError from '../helpers/ApiError'
import { WatchHistoryCreatePayload } from '../interface/watchHistory.interface'
import Course from '../model/course.model'
import httpStatus from 'http-status'
import User from '../model/user.model'
import { WatchHistory } from '../model/watchHistory.interface'
import Module from '../model/module.model'
import Lecture from '../model/lecture.model'
const createWatchHistory = async (payload: WatchHistoryCreatePayload) => {
    const course = await Course.findOne({ id: payload.courseId })
    if (!course) {
        throw new ApiError(httpStatus.NOT_FOUND, 'course not found')
    }
    const user = await User.findOne({ id: payload.userId })
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'user not found')
    }

    const watchHistory = await WatchHistory.findOne({
        courseId: payload.courseId,
        userId: payload.userId,
    })
    if (watchHistory) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'history already exist')
    }
    await WatchHistory.create({
        ...payload,
        user: user._id,
        course: course._id,
    })
    return { message: 'created' }
}

const nextLecture = async (payload: {
    moduleId: string
    lectureId: string
    courseId: string
    historyId: string
}) => {
    const history = await WatchHistory.findOne({ id: payload.historyId })
    if (!history) {
        throw new ApiError(httpStatus.NOT_FOUND, 'history not found')
    }
    const module = await Module.findOne({ id: payload.moduleId })
    if (!module) {
        throw new ApiError(httpStatus.NOT_FOUND, 'course not found')
    }
    const lecture = await Lecture.findOne({ id: payload.lectureId })
    if (!lecture) {
        throw new ApiError(httpStatus.NOT_FOUND, 'user not found')
    }

    const totalLectures = module.lectures?.length
    if (lecture.lectureNumber === totalLectures) {
        // move to next module
    }
    const watchedModule = history.modulesProgress.find(
        (item) => item.module === module._id
    )
    await WatchHistory.findOneAndUpdate({ id: history.id }, {}, { new: true })
}

const WatchHistoryService = { createWatchHistory }
export default WatchHistoryService
