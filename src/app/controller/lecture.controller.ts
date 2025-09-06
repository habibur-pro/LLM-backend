import httpStatus from 'http-status'
import catchAsync from '../helpers/asyncHandler'
import sendResponse from '../helpers/sendResponse'
import LectureService from '../service/lecture.service'

const updateLecture = catchAsync(async (req, res) => {
    const result = await LectureService.updateLecture(req)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'lecture updated successfully',
        data: result,
    })
})
const deleteLecture = catchAsync(async (req, res) => {
    const result = await LectureService.deleteLecture(req)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'lecture deleted successfully',
        data: result,
    })
})
const getLecturesWithFilters = catchAsync(async (req, res) => {
    const result = await LectureService.getLecturesWithFilters(req, res)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'lecture data fetched successfully',
        data: result,
    })
})

const LectureController = {
    updateLecture,
    deleteLecture,
    getLecturesWithFilters,
}
export default LectureController
