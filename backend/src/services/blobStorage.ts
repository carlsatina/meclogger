import { promises as fs } from 'fs'
import path from 'path'
import type { Express } from 'express'
import type { PutBlobResult } from '@vercel/blob'

type UploadResult = {
    url: string
    provider: 'vercel-blob' | 'local'
}

const sanitizeFileName = (name: string) => {
    const cleaned = name.replace(/[^a-zA-Z0-9._-]/g, '-')
    const trimmed = cleaned.replace(/-{2,}/g, '-').replace(/^-+|-+$/g, '')
    return trimmed || 'upload'
}

const writeToLocalDisk = async(file: Express.Multer.File, folder: string): Promise<UploadResult> => {
    const uploadDir = path.resolve(process.cwd(), 'uploaded-images', folder)
    await fs.mkdir(uploadDir, { recursive: true })

    const filename = `${Date.now()}-${sanitizeFileName(file.originalname)}`
    const filePath = path.join(uploadDir, filename)

    await fs.writeFile(filePath, file.buffer)

    return {
        url: `/${folder}/${filename}`,
        provider: 'local'
    }
}

const uploadToVercelBlob = async(file: Express.Multer.File, folder: string, token: string) => {
    const uniqueSuffix = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
    const filename = `${uniqueSuffix}-${sanitizeFileName(file.originalname)}`
    const key = `${folder}/${filename}`

    const { put } = await import('@vercel/blob')
    const blob: PutBlobResult = await put(key, file.buffer, {
        access: 'public',
        token,
        contentType: file.mimetype,
        addRandomSuffix: false
    })

    const result: UploadResult = { url: blob.url, provider: 'vercel-blob' }
    return result
}

export const uploadImageToStorage = async(
    file: Express.Multer.File,
    folder: string = 'vehicles'
): Promise<UploadResult> => {
    const token = process.env.VERCEL_BLOB_READ_WRITE_TOKEN

    if (!file?.buffer || !file.originalname) {
        throw new Error('Invalid file upload payload')
    }

    if (token) {
        try {
            return await uploadToVercelBlob(file, folder, token)
        } catch (error) {
            // Fall back to local disk when blob upload is not available (e.g., local dev).
            console.warn('Vercel Blob upload failed, falling back to local storage', error)
        }
    }

    return writeToLocalDisk(file, folder)
}
