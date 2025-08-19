import httpStatus from 'http-status'
import catchAsync from '../helpers/asyncHandler'
import sendResponse from '../helpers/sendResponse'
import WatchHistoryService from '../service/watchHistory.service'

const createWatchHistory = catchAsync(async (req, res) => {
    const result = await WatchHistoryService.createWatchHistory(req.body)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'watch history created successfully',
        data: result,
    })
})

const WatchHistoryController = {
    createWatchHistory,
}
export default WatchHistoryController
