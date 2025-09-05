import { Request } from 'express'
import ApiError from '../helpers/ApiError'
import { ILecture } from '../interface/lecture.interface'
import Lecture from '../model/lecture.model'
import httpStatus from 'http-status'
import mongoose from 'mongoose'
import Module from '../model/module.model'
import { getErrorMessage } from '../helpers/getErrorMessage'

const updateLecture = async (req: Request) => {
    const id = req.params.lectureId
    const payload: Partial<ILecture> = req.body
    const { video } = req?.uploadedFiles || {}
    const lecture = await Lecture.findOne({ id })
    if (!lecture) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'lecture not found')
    }
    if (video) {
        payload.content = video?.url
    }

    await Lecture.findOneAndUpdate({ id }, payload, { new: true })
    return { message: 'lecture updated' }
}

const deleteLecture = async (req: Request) => {
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        // module have one to many relation like lectures []. i have to remove id from lectures relations
        const lectureId = req.params.lectureId
        const moduleId = req.query.module
        // find module
        const module = await Module.findOne({ id: moduleId }).session(session)
        if (!module)
            throw new ApiError(httpStatus.BAD_REQUEST, 'module not found')
        // find lecture
        const lecture = await Lecture.findOne({ id: lectureId }).session(
            session
        )
        if (!lecture)
            throw new ApiError(httpStatus.BAD_REQUEST, 'lecture not found')

        // delete lecture

        await Lecture.findOneAndDelete({ id: lecture.id }).session(session)
        // remove reference from modules.lectures
        await Module.findOneAndUpdate(
            { id: module.id },
            { $pull: { lectures: lecture._id } }, //  pull lecture ObjectId
            { new: true, session }
        )
        await session.commitTransaction()
    } catch (error) {
        await session.abortTransaction()
        console.log('error', error)
        throw new ApiError(httpStatus.BAD_REQUEST, getErrorMessage(error))
    } finally {
        session.endSession()
    }
}

const LectureService = { updateLecture, deleteLecture }
export default LectureService
