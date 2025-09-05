import httpStatus from 'http-status'
import catchAsync from '../helpers/asyncHandler'
import sendResponse from '../helpers/sendResponse'
import ModuleService from '../service/module.service'

const updateModule = catchAsync(async (req, res) => {
    const moduleId = req.params.moduleId
    const result = await ModuleService.updateModule(moduleId, req.body)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'module updated successfully',
        data: result,
    })
})
const addLecture = catchAsync(async (req, res) => {
    const moduleId = req.params.moduleId
    const result = await ModuleService.addLecture(moduleId, req.body)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'lecture added successfully',
        data: result,
    })
})
const deleteModule = catchAsync(async (req, res) => {
    const result = await ModuleService.deleteModule(req)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'module deleted successfully',
        data: result,
    })
})

const ModuleController = {
    updateModule,
    addLecture,
    deleteModule,
}
export default ModuleController
