import { ICourse } from '../interface/course.interface'
import slugify from 'slugify'
import httpStatus from 'http-status'
import Course from '../model/course.model'
import ApiError from '../helpers/ApiError'
import Module from '../model/module.model'
import { IModule } from '../interface/module.interface'

type uploadedFileType =
    | {
          filename: string
          extension: string
          size: number
          url: string
      }
    | undefined

const addCourse = async (file: uploadedFileType, payload: Partial<ICourse>) => {
    if (!file) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'image is required')
    }
    const slug = slugify(payload.title!, { lower: true })
    const course = await Course.findOne({
        $or: [{ title: payload.title }, { slug }],
    })
    if (course) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            'course already exist by this name'
        )
    }

    const courseData: Partial<ICourse> = {
        ...payload,
        slug,
        thumbnail: file.url,
        availableSeat: payload.totalSeat,
    }
    await Course.create(courseData)
    return { message: 'course created successfully' }
}

const getAllCourse = async () => {
    return await Course.find().populate('module')
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
    const course = await Course.findOne({
        $or: [{ id: identifier }, { slug: identifier }],
    })
    if (!course) {
        throw new ApiError(httpStatus.NOT_FOUND, 'course not found')
    }
    await Module.create({
        courseId: course.id,
        title: payload.title,
        isFree: payload?.isFree || false,
    })
    return { message: 'module created' }
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
