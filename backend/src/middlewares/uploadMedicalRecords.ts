import multer from 'multer'
import path from 'path'
import fs from 'fs'

const uploadPath = path.join(__dirname, '../../uploaded-images/records')

if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true })
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadPath)
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
        const ext = path.extname(file.originalname)
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`)
    }
})

const uploadMedicalRecordFiles = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB per file
    }
})

export default uploadMedicalRecordFiles
