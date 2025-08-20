/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-ignore
import SSLCommerzPayment from 'sslcommerz-lts'
import { Request } from 'express'
import { IOrder } from '../interface/order.interface'
import mongoose from 'mongoose'
import User from '../model/user.model'
import httpStatus from 'http-status'
import ApiError from '../helpers/ApiError'
import Course from '../model/course.model'
import Order from '../model/order.model'
import config from '../config'
import { getErrorMessage } from '../helpers/getErrorMessage'
import Payment from '../model/payment.model'
const placeOrder = async (req: Request) => {
    const payload: { userId: string; courseId: string } = req.body
    console.log('payload', payload)
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        const user = await User.findOne({ id: payload.userId }).session(session)
        if (!user) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'user not found')
        }

        const course = await Course.findOne({ id: payload.courseId }).session(
            session
        )
        if (!course) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'course not found')
        }
        if (course.availableSeat < 1) {
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                'there are not seat available'
            )
        }
        const orderData = {
            amount: course.price,
            user: user._id,
            course: course._id,
        }
        const newOrder = await Order.create([orderData], { session })
        const tranId = `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`
        const paymentData = {
            amount: course.price,
            user: user._id,
            order: newOrder[0]._id,
            transactionId: tranId,
            gateway: 'SSL',
        }
        const newPayment = await Payment.create([paymentData], { session })
        // payment start
        await Order.findOneAndUpdate(
            { id: newOrder[0].id },
            { payment: newPayment[0]._id },
            { new: true, session }
        )
        const store_id = config.ssl_store_id as string
        const store_passwd = config.ssl_store_pass as string
        const is_live = config.is_payment_live === 'true' ? true : false
        const baseUrl = `${req.protocol}://${req.get('host')}/api/v1/payments`
        // const tranId = `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`
        const data = {
            total_amount: course.price,
            currency: 'BDT',
            tran_id: tranId, // use unique tran_id for each api call
            success_url: `${baseUrl}/success/${tranId}`,
            fail_url: `${baseUrl}/fail/${tranId}`,
            cancel_url: `${baseUrl}/fail/${tranId}`,
            ipn_url: `${baseUrl}/ipn`,
            shipping_method: 'Courier',
            product_name: `${course.title || '-'}`,
            product_category: 'course',
            product_profile: 'general',
            cus_name: user.name,
            cus_email: user.email || '',
            cus_add1: 'f',
            cus_add2: 'f',
            cus_city: 'f',
            cus_state: 'f',
            cus_postcode: 1000,
            cus_country: 'Bangladesh',
            cus_phone: user.phone || '-',
            cus_fax: 'f',
            ship_name: user.name,
            ship_add1: 'f',
            ship_add2: 'f',
            ship_city: 'f',
            ship_state: 'f',
            ship_postcode: 1000,
            ship_country: 'Bangladesh',
        }

        const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
        const apiResponse = await sslcz.init(data)
        const gatewayPageURL = apiResponse?.GatewayPageURL
        await session.commitTransaction()
        return { url: gatewayPageURL }
    } catch (error) {
        console.log(error)
        await session.abortTransaction()
        throw new ApiError(httpStatus.BAD_REQUEST, getErrorMessage(error))
    } finally {
        await session.endSession()
    }
}
const getAllOrder = async () => {
    return await Order.find().populate(['user', 'course', 'payment'])
}
const OrderService = { placeOrder, getAllOrder }
export default OrderService
