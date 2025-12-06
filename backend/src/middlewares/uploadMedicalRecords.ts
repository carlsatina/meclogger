import multer from 'multer'

const uploadMedicalRecordFiles = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB per file
    }
})

export default uploadMedicalRecordFiles
