import httpStatus from 'http-status'
import catchAsync from '../helpers/asyncHandler'
import sendResponse from '../helpers/sendResponse'
import CourseService from '../service/course.service'
import ApiError from '../helpers/ApiError'

const addCourse = catchAsync(async (req, res) => {
    const result = await CourseService.addCourse(req.uploadedFile, req.body)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'course added successfully',
        data: result,
    })
})
const getCourseBySlugAndId = catchAsync(async (req, res) => {
    const identifier = req.params.slugOrId
    const result = await CourseService.getCourseBySlugAndId(identifier)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'course fetched successfully',
        data: result,
    })
})
const updateCourse = catchAsync(async (req, res) => {
    const identifier = req.params.slugOrId
    const result = await CourseService.updateCourse(
        identifier,
        req.body,
        req.uploadedFile
    )
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'course updated successfully',
        data: result,
    })
})
const getAllCourse = catchAsync(async (req, res) => {
    const result = await CourseService.getAllCourse()
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'courses fetched successfully',
        data: result,
    })
})
const getModuleOfCourse = catchAsync(async (req, res) => {
    const identifier = req.params.slugOrId
    const result = await CourseService.getModuleOfCourse(identifier)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'courses fetched successfully',
        data: result,
    })
})
const addCourseModule = catchAsync(async (req, res) => {
    const identifier = req.params.slugOrId
    const result = await CourseService.addModule(identifier, req.body)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'module added successfully',
        data: result,
    })
})

const CourseController = {
    addCourse,
    getCourseBySlugAndId,
    updateCourse,
    getAllCourse,
    getModuleOfCourse,
    addCourseModule,
}
export default CourseController
