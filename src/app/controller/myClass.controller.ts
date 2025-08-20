import httpStatus from 'http-status'
import catchAsync from '../helpers/asyncHandler'
import OrderService from '../service/order.service'
import sendResponse from '../helpers/sendResponse'
import MyClassService from '../service/myClass.service'

const getMyClasses = catchAsync(async (req, res) => {
    const data = await MyClassService.getMyClasses(req)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'my classes  fetched successfully',
        data: data,
    })
})
const nextLecture = catchAsync(async (req, res) => {
    const classId = req.params.classId
    const data = await MyClassService.nextLecture(classId)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'move to next lecture successfully',
        data: data,
    })
})
const previousLecture = catchAsync(async (req, res) => {
    const classId = req.params.classId
    const data = await MyClassService.previousLecture(classId)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'move to previous lecture successfully',
        data: data,
    })
})
const singleClassProgress = catchAsync(async (req, res) => {
    const classId = req.params.classId
    const data = await MyClassService.getSingleClassWithProgress(classId)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'single class progress fetched successfully',
        data: data,
    })
})

const MyClassController = {
    getMyClasses,
    nextLecture,
    previousLecture,
    singleClassProgress,
}
export default MyClassController
