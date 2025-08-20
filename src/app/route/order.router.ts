import { Router } from 'express'
import OrderController from '../controller/order.controller'

const router = Router()
router.post('/', OrderController.placeOrder)
router.get('/', OrderController.getAllOrder)
const OrderRouter = router
export default OrderRouter
