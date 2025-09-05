import httpStatus from 'http-status'
import Course from '../model/course.model'
import ApiError from '../helpers/ApiError'
import { IModule } from '../interface/module.interface'
import Module from '../model/module.model'
import { ILecture } from '../interface/lecture.interface'
import Lecture from '../model/lecture.model'
import { Request } from 'express'
import { getErrorMessage } from '../helpers/getErrorMessage'
import mongoose from 'mongoose'

const updateModule = async (id: string, payload: Partial<IModule>) => {
    const module = await Module.findOne({ id })
    if (!module) {
        throw new ApiError(httpStatus.NOT_FOUND, 'module not found')
    }
    delete payload.id
    delete payload.lectures
    await Module.findOneAndUpdate({ id }, payload, { new: true })

    return { message: 'updated' }
}

const addLecture = async (id: string, payload: Partial<ILecture>) => {
    const module = await Module.findOne({ id })
    if (!module) {
        throw new ApiError(httpStatus.NOT_FOUND, 'module not found')
    }
    const newLecture = await Lecture.create({ ...payload, moduleId: id })
    await Module.findOneAndUpdate(
        { id },
        { $push: { lectures: newLecture._id } },
        { new: true }
    )
    return { message: 'lecture added' }
}

const deleteModule = async (req: Request) => {
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        // course have one to many relation like modules []. i have to remove id from modules relations
        const moduleId = req.params.moduleId
        const courseId = req.query.course
        // find course
        const course = await Course.findOne({ id: courseId }).session(session)
        if (!course)
            throw new ApiError(httpStatus.BAD_REQUEST, 'course not found')
        // find module
        const module = await Module.findOne({ id: moduleId }).session(session)
        if (!module)
            throw new ApiError(httpStatus.BAD_REQUEST, 'module not found')
        console.log('module', module)
        // delete all lectures in module. lectures array stores ObjectId
        if (module.lectures.length > 0) {
            await Lecture.deleteMany({ _id: { $in: module.lectures } }).session(
                session
            )
        }
        await Module.findOneAndDelete({ id: module.id }).session(session)
        // remove reference from course.modules
        await Course.findOneAndUpdate(
            { id: course.id },
            { $pull: { modules: module._id } }, // ✅ pull module ObjectId
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

const ModuleService = {
    updateModule,
    addLecture,
    deleteModule,
}
export default ModuleService
