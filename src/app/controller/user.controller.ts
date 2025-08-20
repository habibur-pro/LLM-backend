import httpStatus from 'http-status'
import catchAsync from '../helpers/asyncHandler'
import sendResponse from '../helpers/sendResponse'
import UserService from '../service/user.service'

const updateUser = catchAsync(async (req, res) => {
    const data = await UserService.updateUser(req)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'user updated successfully',
        data: data,
    })
})
const getAllInstructor = catchAsync(async (req, res) => {
    const data = await UserService.getAllInstructor()
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'instructors updated successfully',
        data: data,
    })
})

const getAllStudent = catchAsync(async (req, res) => {
    const data = await UserService.getAllStudent()
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'all students fetched successfully',
        data: data,
    })
})
const UserController = {
    getAllStudent,
    getAllInstructor,
    updateUser,
}
export default UserController
