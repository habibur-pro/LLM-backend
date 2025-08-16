import httpStatus from 'http-status'
import catchAsync from '../helpers/asyncHandler'
import sendResponse from '../helpers/sendResponse'
import AuthService from '../service/auth.service'

const signup = catchAsync(async (req, res) => {
    const data = await AuthService.signup(req.body)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'signup success',
        data: data,
    })
})
const signIn = catchAsync(async (req, res) => {
    const data = await AuthService.signin(req.body)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'signin success',
        data: data,
    })
})

const verifySignin = catchAsync(async (req, res) => {
    const data = await AuthService.verifySignin(req.body)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'verify signin success',
        data: data,
    })
})

const refreshToken = catchAsync(async (req, res) => {
    const data = await AuthService.refreshToken(req.body)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'token refresh success',
        data: data,
    })
})
const AuthController = {
    signup,
    signIn,
    verifySignin,
    refreshToken,
}
export default AuthController
