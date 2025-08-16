import { Response } from 'express'

type TSendResponse<T> = {
    statusCode: number
    message: string
    success: boolean
    data?: T
}

const sendResponse = <T>(res: Response, resData: TSendResponse<T>) => {
    return res.status(resData.statusCode).json({
        status: resData.statusCode,
        success: resData.success,
        message: resData.message,
        data: resData.data || { message: 'done' },
    })
}
export default sendResponse
