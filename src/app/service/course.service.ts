import { ICourse } from '../interface/course.interface'
import slugify from 'slugify'
import httpStatus from 'http-status'
import Course from '../model/course.model'
import ApiError from '../helpers/ApiError'
const addCourse = async (payload: Partial<ICourse>) => {
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

    const courseData: Partial<ICourse> = { ...payload, slug }
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
const updateCourse = async (identifier: string, payload: Partial<ICourse>) => {
    const course = await Course.findOne({
        $or: [{ id: identifier }, { slug: identifier }],
    })
    if (!course) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'course not found')
    }
    delete payload.id
    delete payload.slug

    //implement image upload
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

const CourseService = {
    addCourse,
    getAllCourse,
    updateCourse,
    getCourseBySlugAndId,
}
export default CourseService
