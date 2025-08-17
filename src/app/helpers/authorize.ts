/* eslint-disable @typescript-eslint/no-namespace */
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import httpStatus from 'http-status'
import ApiError from '../helpers/ApiError'
import config from '../config'
import { UserRole } from '../enum'

interface JwtPayload {
    id: string
    role: UserRole
}

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload
        }
    }
}

// ✅ Reusable authorize middleware
export const authorize =
    (...allowedRoles: UserRole[]) =>
    (req: Request, res: Response, next: NextFunction) => {
        try {
            // 1. Extract token
            const authHeader = req.headers.authorization
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                throw new ApiError(httpStatus.UNAUTHORIZED, 'No token provided')
            }

            const token = authHeader.split(' ')[1]

            // 2. Verify token
            const decoded = jwt.verify(
                token,
                config.access_token_secret as string
            ) as JwtPayload

            if (!decoded) {
                throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token')
            }

            // 3. Role check (if roles are passed)
            if (allowedRoles.length && !allowedRoles.includes(decoded.role)) {
                throw new ApiError(httpStatus.FORBIDDEN, 'Access denied')
            }

            // 4. Attach user to request
            req.user = decoded

            next()
        } catch (error: any) {
            next(
                error instanceof ApiError
                    ? error
                    : new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized')
            )
        }
    }
