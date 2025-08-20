import catchAsync from '../helpers/asyncHandler'
import PaymentService from '../service/payment.service'

const successPayment = catchAsync(async (req, res) => {
    await PaymentService.successPayment(req, res)
})
const failedPayment = catchAsync(async (req, res) => {
    await PaymentService.failedPayment(req, res)
})

const PaymentController = { successPayment, failedPayment }
export default PaymentController
