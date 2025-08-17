/* eslint-disable @typescript-eslint/no-namespace */
import multer from 'multer'
import { Request, Response, NextFunction } from 'express'
import path from 'path'
import cloudinary from '../config/cloudinaryConfig'

// ✅ Extend Express Request to include uploadedFile
declare global {
    namespace Express {
        interface Request {
            uploadedFile?: {
                filename: string
                extension: string
                size: number // in bytes
                url: string
            }
        }
    }
}

// ✅ Multer memory storage (for buffer)
const storage = multer.memoryStorage()
const upload = multer({ storage })

// ✅ Upload a buffer to Cloudinary
const uploadToCloudinary = async (
    fileBuffer: Buffer,
    mimetype: string,
    folder = 'minimal-LLM'
): Promise<string> => {
    const base64 = `data:${mimetype};base64,${fileBuffer.toString('base64')}`
    const result = await cloudinary.uploader.upload(base64, {
        folder,
        resource_type: 'auto',
    })
    return result.secure_url
}

// ✅ Middleware for single file upload
export const cloudinaryUploader = (
    fieldName: string = 'file',
    folder: string = 'minimal-LLM'
) => {
    const multerHandler = upload.single(fieldName)

    return async (req: Request, res: Response, next: NextFunction) => {
        multerHandler(req, res, async (err: any) => {
            if (err) return res.status(400).json({ error: err.message })

            try {
                const file = req.file
                console.log('file', file)
                if (!file) {
                    req.uploadedFile = undefined
                    return next()
                }

                const url = await uploadToCloudinary(
                    file.buffer,
                    file.mimetype,
                    folder
                )
                const extension = path
                    .extname(file.originalname)
                    .replace('.', '')

                req.uploadedFile = {
                    filename: file.originalname,
                    extension,
                    size: file.size,
                    url,
                }

                next()
            } catch (uploadErr) {
                console.error('Cloudinary upload failed:', uploadErr)
                res.status(500).json({ error: 'Cloudinary upload failed' })
            }
        })
    }
}
