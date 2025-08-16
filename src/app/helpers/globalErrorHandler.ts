import { ErrorRequestHandler, NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'

import handleZodError from './handleZodError'
import ApiError from './ApiErrot'
import { IGenericErrorMessages } from './helper.interface'
import config from '../config'

const globalErrorHandler: ErrorRequestHandler = (
    error,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: NextFunction
) => {
    let statusCode = 500
    let message = 'Something went wrong !'
    let errorMessages: IGenericErrorMessages[] = []

    if (error instanceof ZodError) {
        const simplifiedError = handleZodError(error)
        statusCode = simplifiedError.statusCode
        message = simplifiedError.message
        errorMessages = simplifiedError.errorMessages
    } else if (error instanceof ApiError) {
        statusCode = error?.statusCode
        message = error.message
        errorMessages = error?.message
            ? [
                  {
                      path: '',
                      message: error?.message,
                  },
              ]
            : []
    } else if (error instanceof Error) {
        message = error?.message
        errorMessages = error?.message
            ? [
                  {
                      path: '',
                      message: error?.message,
                  },
              ]
            : []
    }

    res.status(statusCode).json({
        success: false,
        message,
        errorMessages,
        stack: config.env !== 'production' ? error?.stack : undefined,
    })
}

export default globalErrorHandler
