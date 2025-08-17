import httpStatus from 'http-status'
import Course from '../model/course.model'
import ApiError from '../helpers/ApiError'
import { IModule } from '../interface/module.interface'
import Module from '../model/module.model'
import { ILecture } from '../interface/lecture.interface'
import Lecture from '../model/lecture.model'

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
    await Module.findOneAndUpdate(
        { id },
        { $push: { lectures: newLecture._id } },
        { new: true }
    )
    return { message: 'lecture added' }
}

const ModuleService = {
    updateModule,
    addLecture,
}
export default ModuleService
