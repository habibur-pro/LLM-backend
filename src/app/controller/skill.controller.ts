import httpStatus from 'http-status'
import sendResponse from '../helpers/sendResponse'
import skillServices from '../service/skill.service'
import catchAsync from '../helpers/asyncHandler'

const addSkill = catchAsync(async (req, res) => {
    const data = await skillServices.addSkill(req.body)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'skill added successfully',
        data: data,
    })
})
const skillControls = {
    addSkill,
}
export default skillControls
