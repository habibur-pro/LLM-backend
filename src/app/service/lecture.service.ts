import { query, Request } from 'express'
import ApiError from '../helpers/ApiError'
import { ILecture } from '../interface/lecture.interface'
import Lecture from '../model/lecture.model'
import httpStatus from 'http-status'
import mongoose from 'mongoose'
import Module from '../model/module.model'
import { getErrorMessage } from '../helpers/getErrorMessage'
import Course from '../model/course.model'
import { LectureContentType } from '../enum'

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

export const getLecturesWithFilters = async (req: Request, res: Response) => {
    try {
        const { courseId, moduleId } = req.query
        console.log('courseId:', courseId, 'moduleId:', moduleId)
        // --- Step 1: Always send filters
        const courses = await Course.find().select('_id title').lean()
        const modules = await Module.find()
            .select('_id title courseId lectures')
            .lean()
        const lectureTypes = Object.values(LectureContentType)

        // --- Step 2: Determine which module IDs to fetch lectures from
        let targetModuleIds: mongoose.Types.ObjectId[] = []

        if (moduleId && mongoose.Types.ObjectId.isValid(moduleId.toString())) {
            targetModuleIds = [new mongoose.Types.ObjectId(moduleId.toString())]
        } else if (
            courseId &&
            mongoose.Types.ObjectId.isValid(courseId.toString())
        ) {
            const course = await Course.findById(courseId)
                .select('modules')
                .lean()
            if (!course)
                throw new ApiError(httpStatus.BAD_REQUEST, 'Course not found')
            targetModuleIds = course.modules as mongoose.Types.ObjectId[]
        } else {
            targetModuleIds = modules.map((m) => m._id)
        }

        // --- Step 3: Fetch lectures from modules
        const modulesWithLectures = modules.filter((m) =>
            targetModuleIds.includes(m._id)
        )

        const lectureIds = modulesWithLectures.flatMap((m) => m.lectures)

        const lectures = lectureIds.length
            ? await Lecture.find({ _id: { $in: lectureIds } }).lean()
            : []

        // --- Step 4: Attach module & course info to each lecture
        const lecturesWithInfo = lectures.map((lec) => {
            const module = modules.find((m) => m.lectures.includes(lec._id))
            const course = module
                ? courses.find(
                      (c) => c._id.toString() === module.courseId?.toString()
                  )
                : null

            return {
                ...lec,
                module: module
                    ? { _id: module._id, title: module.title }
                    : null,
                course: course
                    ? { _id: course._id, title: course.title }
                    : null,
            }
        })

        // --- Step 5: Return response
        const responseData = {
            filters: { courses, modules, lectureTypes },
            data: lecturesWithInfo,
        }
        return responseData
    } catch (error: any) {
        console.error(error)
        // return res.status(400).json({
        //     success: false,
        //     message: 'Failed to fetch lectures',
        //     errorMessages: [{ path: '', message: error.message }],
        // })
    }
}
const LectureService = { updateLecture, deleteLecture, getLecturesWithFilters }
export default LectureService
