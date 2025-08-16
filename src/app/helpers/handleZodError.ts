import { ZodError, ZodIssue } from 'zod'
import {
    IGenericErrorMessages,
    IGenericErrorResponse,
} from './helper.interface'

const handleZodError = (error: ZodError): IGenericErrorResponse => {
    const errors: IGenericErrorMessages[] = error.issues.map(
        (issue: ZodIssue) => {
            return {
                path: issue?.path[issue.path.length - 1],
                message: issue?.message,
            }
        }
    )

    const statusCode = 400
    return {
        statusCode,
        message: 'Zod Validation Error',
        errorMessages: errors,
    }
}
export default handleZodError
