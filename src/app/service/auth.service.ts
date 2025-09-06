import httpStatus from 'http-status'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import ms from 'ms'
import config from '../config'
import { IUser } from '../interface/user.interface'
import User from '../model/user.model'
import ApiError from '../helpers/ApiError'
import { getErrorMessage } from '../helpers/getErrorMessage'
import RefreshToken from '../model/refreshToken.model'
import { Request, Response } from 'express'
const refreshTokensDB: string[] = []

function generateAccessToken(user: any) {
    return jwt.sign(user, config.access_token_secret, {
        expiresIn: config.access_token_expires_in as any,
    })
}

const setRefreshToken = async (res: Response, token: string) => {
    const refreshTokenExpiryMs = ms(config.refresh_token_expires_in as any)
    res.cookie('refreshToken', token, {
        httpOnly: true, // prevents JS access
        secure: false, //it will true for production
        sameSite: 'strict',
        maxAge: Number(refreshTokenExpiryMs), // cookie expiration in ms
        path: '/',
    })
}
const generateRefreshToken = async (user: IUser): Promise<string> => {
    const expiresInMs = ms(config.refresh_token_expires_in as any)
    // calculate expiresAt date
    const expiresAt = new Date(Date.now() + expiresInMs)
    if (!expiresInMs) throw new Error('Invalid refresh token expiry')

    const newToken = jwt.sign({ id: user.id }, config.refresh_token_secret, {
        expiresIn: config.refresh_token_expires_in as any,
    })
    // delete if token exist
    await RefreshToken.deleteMany({ userId: user.id })
    // create new refresh token
    await RefreshToken.create({
        userId: user.id,
        token: newToken,
        expiresAt,
    })

    return newToken
}

const signup = async (payload: Partial<IUser>) => {
    try {
        const isExist = await User.findOne({
            $or: [{ email: payload.email }, { phone: payload.phone }],
        })
        if (isExist)
            throw new ApiError(
                httpStatus.CONFLICT,
                'phone or email already exist'
            )
        if (!payload.password) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Password is required')
        }
        // hash password
        const hashedPassword = await bcrypt.hash(payload.password, 10)
        payload.password = hashedPassword

        await User.create(payload)

        return { message: 'success' }
    } catch (error) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            getErrorMessage(error) || 'something went wrong'
        )
    }
}

const signin = async (req: Request, res: Response) => {
    try {
        const payload: { email: string; password: string } = req.body
        if (!payload?.email || !payload?.password) {
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                'email, password is required'
            )
        }

        const user = await User.findOne({ email: payload.email })
        if (!user) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'user not found')
        }
        const isMatched = await bcrypt.compare(payload.password, user.password)
        if (!isMatched) {
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                'wrong email or password'
            )
        }

        const accessToken = generateAccessToken({
            id: user.id,
            email: user.email,
            role: user.role,
        })

        const refreshToken = await generateRefreshToken(user)
        // set refresh token to cookie
        await setRefreshToken(res, refreshToken)
        // calculate expiry timestamps
        const accessTokenExpiresInMs = ms(
            (config.access_token_expires_in as any) || '15m'
        )
        const responseData = {
            id: user.id,
            name: user.name,
            accessToken,
            email: user.email,
            role: user.role,
            accessTokenExpiresAt: Date.now() + accessTokenExpiresInMs,
        }

        return responseData
    } catch (error) {
        console.log('signin error', error)
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            getErrorMessage(error) || 'something went wrong'
        )
    }
}
const verifySignin = async (payload: { email: string; password: string }) => {
    if (!payload?.email || !payload?.password) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            'email and password is required'
        )
    }
    console.log(payload)
    const user = await User.findOne({ email: payload.email })
    if (!user) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'user not found')
    }
    const isMatched = await bcrypt.compare(payload.password, user.password)
    if (!isMatched) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'wrong email or password')
    }
    return { role: user.role }
}

const refreshToken = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.cookies
        console.log({ refreshToken })
        // check refresh token into cookie
        if (!refreshToken) {
            throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized access')
        }

        // check into db
        const savedToken = await RefreshToken.findOne({ token: refreshToken })
        if (!savedToken) {
            throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized access')
        }

        // Verify refresh token and extract user payload
        const token = jwt.verify(refreshToken, config.refresh_token_secret) as {
            id: string
        }
        const user = await User.findOne({ id: token.id })
        if (!user) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'user not found')
        }

        // Generate new access token
        const accessToken = generateAccessToken({
            id: user.id,
            email: user.email,
            role: user.role,
        })
        // Generate new refresh token
        const newRefreshToken = await generateRefreshToken(user)
        // set refresh token to cookie
        await setRefreshToken(res, newRefreshToken)
        // calculate expiry timestamps
        const accessTokenExpiresInMs = ms(
            (config.access_token_expires_in as any) || '15m'
        )
        return {
            accessToken,
            accessTokenExpiresAt: Date.now() + accessTokenExpiresInMs,
        }
    } catch (error) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid refresh token')
    }
}

const AuthService = {
    signup,
    signin,
    verifySignin,
    refreshToken,
}
export default AuthService
