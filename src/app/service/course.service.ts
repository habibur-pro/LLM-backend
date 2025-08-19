import { IAddCoursePayload, ICourse } from '../interface/course.interface'
import slugify from 'slugify'
import httpStatus from 'http-status'
import Course from '../model/course.model'
import ApiError from '../helpers/ApiError'
import Module from '../model/module.model'
import { IModule } from '../interface/module.interface'
import mongoose, { Schema, Types } from 'mongoose'
import { getErrorMessage } from '../helpers/getErrorMessage'
import { Request } from 'express'
import Lecture from '../model/lecture.model'

const addCourse = async (req: Request) => {
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        const { coverPhoto, thumbnail } = req?.uploadedFiles || {}

        const payload: IAddCoursePayload = JSON.parse(req?.body?.data)
        if (!coverPhoto || !thumbnail) {
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                'coverPhoto and thumbnail are required'
            )
        }
        const slug = slugify(payload.title as string, {
            lower: true,
            replacement: '-',
            trim: true,
        })
        const course = await Course.findOne({
            $or: [{ title: payload.title }, { slug }],
        }).session(session)
        if (course) {
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                'course already exist by this name'
            )
        }

        const moduleIds: Types.ObjectId[] = []

        // Create Modules & Contents if provided
        if (payload?.modules && payload.modules.length > 0) {
            for (const mod of payload.modules) {
                const lectureIds: string[] = []
                if (mod.lectures && mod.lectures.length > 0) {
                    for (const lecture of mod.lectures) {
                        const newContent = new Lecture(lecture)
                        await newContent.save({ session })
                        lectureIds.push(newContent._id.toString())
                    }
                }
                console.log('lecture ids', lectureIds)
                const newModule = new Module({
                    title: mod.title,
                    lectures: lectureIds,
                })
                await newModule.save({ session })
                moduleIds.push(newModule?._id)
            }
        }

        const courseData: Partial<ICourse> = {
            ...payload,
            slug,
            thumbnail: thumbnail?.url,
            coverPhoto: coverPhoto?.url,
            availableSeat: payload.totalSeat,
            modules: moduleIds,
        }
        const newCourse = await Course.create([courseData], { session })
        await session.commitTransaction()
        return { message: 'course created successfully' }
    } catch (error) {
        await session.abortTransaction()
        console.log('error', error)
        throw new ApiError(httpStatus.BAD_REQUEST, getErrorMessage(error))
    } finally {
        await session.endSession()
    }
}

const getAllCourse = async () => {
    return await Course.find().populate('modules')
}
const getCourseBySlugAndId = async (identifier: string) => {
    return await Course.find({
        $or: [{ slug: identifier }, { id: identifier }],
    }).populate('module')
}
const updateCourse = async (
    identifier: string,
    payload: Partial<ICourse>,
    file: uploadedFileType
) => {
    const course = await Course.findOne({
        $or: [{ id: identifier }, { slug: identifier }],
    })
    if (!course) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'course not found')
    }
    delete payload.id
    delete payload.slug
    if (file) {
        payload.thumbnail = file.url
    }
    await Course.findOneAndUpdate(
        {
            $or: [{ id: identifier }, { slug: identifier }],
        },
        payload,
        {
            new: true,
        }
    )
    return { message: 'updated' }
}

const getModuleOfCourse = async (identifier: string) => {
    const course = await Course.findOne({
        $or: [{ id: identifier }, { slug: identifier }],
    })
    if (!course) {
        throw new ApiError(httpStatus.NOT_FOUND, 'course not found')
    }
    const modules = await Module.find({ courseId: course.id }).populate(
        'lectures'
    )
    return modules
}

const addModule = async (identifier: string, payload: Partial<IModule>) => {
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        const course = await Course.findOne({
            $or: [{ id: identifier }, { slug: identifier }],
        }).session(session)
        if (!course) {
            throw new ApiError(httpStatus.NOT_FOUND, 'course not found')
        }
        const newModule = await Module.create(
            [
                {
                    courseId: course.id,
                    title: payload.title,
                    isFree: payload?.isFree || false,
                },
            ],
            { session }
        )
        await Course.findOneAndUpdate(
            { id: course?.id },
            { $push: { modules: newModule[0]._id } },
            { new: true, session }
        )
        await session.commitTransaction()
        return { message: 'module created' }
    } catch (error) {
        await session.abortTransaction()
        throw new ApiError(httpStatus.BAD_REQUEST, getErrorMessage(error))
    } finally {
        await session.endSession()
    }
}

const CourseService = {
    addCourse,
    getAllCourse,
    updateCourse,
    getCourseBySlugAndId,
    getModuleOfCourse,
    addModule,
}
export default CourseService
