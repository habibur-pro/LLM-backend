import { query, Request, Response } from 'express'
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

const getLecturesWithFilters = async (req: Request, res: Response) => {
    try {
        const { courseId, moduleId, searchTerm } = req.query

        const lectureQuery: any = {}

        // Step 1: Filter lectures by module or course
        if (moduleId && mongoose.Types.ObjectId.isValid(moduleId.toString())) {
            const module = await Module.findById(moduleId)
                .select('lectures')
                .lean()
            if (module) {
                lectureQuery._id = { $in: module.lectures }
            }
        } else if (
            courseId &&
            mongoose.Types.ObjectId.isValid(courseId.toString())
        ) {
            const course = await Course.findById(courseId)
                .select('modules')
                .lean()
            if (course) {
                const modulesInCourse = await Module.find({
                    _id: { $in: course.modules },
                })
                    .select('lectures')
                    .lean()
                const lectureIds = modulesInCourse.flatMap((m) => m.lectures)
                lectureQuery._id = { $in: lectureIds }
            }
        }

        // Step 2: Search term
        if (
            searchTerm &&
            typeof searchTerm === 'string' &&
            searchTerm.trim() !== ''
        ) {
            const searchRegex = new RegExp(searchTerm, 'i')
            lectureQuery.title = { $regex: searchRegex }
        }

        // Step 3: Fetch lectures
        const lectures = await Lecture.find(lectureQuery).lean()

        // Step 4: Fetch all courses + modules
        const courses = await Course.find().select('_id title modules').lean()
        const modules = await Module.find().select('_id title lectures').lean()

        // Step 5: Attach module + course info
        const lecturesWithInfo = lectures.map((lec) => {
            const module = modules.find((m) =>
                m.lectures?.some((lId) => lId.equals(lec._id))
            )

            let course: any = null
            if (module) {
                course = courses.find((c) =>
                    c.modules?.some((modId) => modId.equals(module._id))
                )
            }

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

        // Step 6: Modules filter list (scoped by course if provided)
        let modulesForFilter = modules
        if (courseId && mongoose.Types.ObjectId.isValid(courseId.toString())) {
            const course = courses.find(
                (c) => c._id.toString() === courseId.toString()
            )
            if (course) {
                modulesForFilter = modules.filter((m) =>
                    course.modules?.some((modId) => modId.equals(m._id))
                )
            }
        }

        // Step 7: Response
        const lectureTypes = Object.values(LectureContentType)

        const responseData = {
            filters: {
                courses: courses.map((c) => ({ _id: c._id, title: c.title })),
                modules: modulesForFilter.map((m) => ({
                    _id: m._id,
                    title: m.title,
                })),
                lectureTypes,
            },
            data: lecturesWithInfo,
        }

        return responseData
    } catch (error: any) {
        console.error('Error fetching lectures:', error)
        res.status(httpStatus.BAD_REQUEST).json({
            success: false,
            message: 'Failed to fetch lectures',
            errorMessages: [{ path: '', message: error.message }],
        })
    }
}

const LectureService = { updateLecture, deleteLecture, getLecturesWithFilters }
export default LectureService
