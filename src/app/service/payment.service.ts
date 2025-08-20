import { Request, Response } from 'express'
import mongoose from 'mongoose'
import httpsStatus from 'http-status'
import Payment from '../model/payment.model'
import { OrderStatus, PaymentStatus } from '../enum'
import ApiError from '../helpers/ApiError'
import Order from '../model/order.model'
import Course from '../model/course.model'
import config from '../config'
import MyClass from '../model/myClass.model'
import User from '../model/user.model'
import Module from '../model/module.model'

const successPayment = async (req: Request, res: Response) => {
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        const tranId = req.params.tranId
        console.log({ tranId })

        const updatePayment = await Payment.findOneAndUpdate(
            { transactionId: tranId },
            { status: PaymentStatus.COMPLETE },
            { new: true, session }
        )
        if (!updatePayment) {
            throw new ApiError(httpsStatus.BAD_REQUEST, 'payment failed')
        }
        // update order status
        const updatedOrder = await Order.findByIdAndUpdate(
            updatePayment.order,
            {
                status: OrderStatus.COMPLETE,
            },
            { new: true, session }
        )
        // update course seat
        const updatedCourse = await Course.findByIdAndUpdate(
            updatedOrder?.course,
            {
                $inc: { availableSeat: -1 },
            }
        )
        // first module of this corse
        const firstModule = await Module.findById(updatedCourse?.modules[0])

        // create my classes for getting course progress and watch lecture
        await MyClass.create({
            user: updatedOrder?.user,
            course: updatedOrder?.course,
            overallProgress: 0,
            prevLecture: firstModule?.lectures[0],
            currentLecture: firstModule?.lectures[0],
        })

        const url = `${config.frontend_url}/order/success`
        await session.commitTransaction()
        res.redirect(url)
    } catch (error) {
        await session.abortTransaction()
        console.error('Payment success handling failed:', error)
        res.redirect(`${config.frontend_url}/order/fail`)
    } finally {
        await session.endSession()
    }
}
const failedPayment = async (req: Request, res: Response) => {
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        const tranId = req.params.tranId

        const updatePayment = await Payment.findOneAndUpdate(
            { transactionId: tranId },
            { status: PaymentStatus.FAILED },
            { new: true, session }
        )

        await Order.findByIdAndUpdate(
            updatePayment?.order,
            {
                status: OrderStatus.CANCELED,
            },
            { new: true, session }
        )

        const url = `${config.frontend_url}/order/fail`
        await session.commitTransaction()
        res.redirect(url)
    } catch (error) {
        await session.abortTransaction()
        console.error('Payment success handling failed:', error)
        res.redirect(`${config.frontend_url}/order/fail`)
    } finally {
        await session.endSession()
    }
}

const PaymentService = { successPayment, failedPayment }
export default PaymentService
