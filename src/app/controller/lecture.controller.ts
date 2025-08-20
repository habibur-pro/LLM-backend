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

const LectureController = {
    updateLecture,
}
export default LectureController
