import { Request } from 'express'
import ApiError from '../helpers/ApiError'
import { ILecture } from '../interface/lecture.interface'
import Lecture from '../model/lecture.model'
import httpStatus from 'http-status'

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

const LectureService = { updateLecture }
export default LectureService
