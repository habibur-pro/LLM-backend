import ApiError from '../helpers/ApiError'
import { ILecture } from '../interface/lecture.interface'
import Lecture from '../model/lecture.model'
import httpStatus from 'http-status'
type uploadedFileType =
    | {
          filename: string
          extension: string
          size: number
          url: string
      }
    | undefined
const updateLecture = async (
    id: string,
    payload: Partial<ILecture>,
    file: uploadedFileType
) => {
    const lecture = await Lecture.findOne({ id })
    if (!lecture) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'lecture not found')
    }
    if (file) {
        payload.content = file.url
    }

    await Lecture.findOneAndUpdate({ id }, payload, { new: true })
    return { message: 'lecture updated' }
}

const LectureService = { updateLecture }
export default LectureService
