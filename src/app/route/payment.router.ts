import { Router } from 'express'
import PaymentController from '../controller/payment.controller'

const router = Router()
router.post('/success/:tranId', PaymentController.successPayment)
router.post('/fail/:tranId', PaymentController.failedPayment)
const PaymentRouter = router
export default PaymentRouter
