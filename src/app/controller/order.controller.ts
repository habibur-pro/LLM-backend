import httpStatus from 'http-status'
import catchAsync from '../helpers/asyncHandler'
import OrderService from '../service/order.service'
import sendResponse from '../helpers/sendResponse'

const placeOrder = catchAsync(async (req, res) => {
    const data = await OrderService.placeOrder(req)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'order placed successfully',
        data: data,
    })
})
const getAllOrder = catchAsync(async (req, res) => {
    const data = await OrderService.getAllOrder()
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'orders fetched successfully',
        data: data,
    })
})

const OrderController = { placeOrder, getAllOrder }
export default OrderController
