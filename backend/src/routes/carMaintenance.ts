import { RequestHandler, Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { addVehicle, addMaintenanceRecord, listVehicles, listMaintenanceRecords, getVehicle, updateVehicle, getMaintenanceRecord, deleteMaintenanceRecord } from '../controller/carMaintenanceController'
import uploadVehicleImage from '../middlewares/uploadVehicleImage'

const makeCarMaintenanceRouter = (
    _dbClient: PrismaClient,
    authenticateUser: RequestHandler
): Router => {
    const router = Router()

    router.get('/vehicles', authenticateUser, listVehicles)
    router.get('/vehicles/:id', authenticateUser, getVehicle)
    router.post('/vehicles', authenticateUser, uploadVehicleImage.single('image'), addVehicle)
    router.put('/vehicles/:id', authenticateUser, uploadVehicleImage.single('image'), updateVehicle)
    router.get('/maintenance-records', authenticateUser, listMaintenanceRecords)
    router.post('/maintenance-records', authenticateUser, addMaintenanceRecord)
    router.get('/maintenance-records/:id', authenticateUser, getMaintenanceRecord)
    router.delete('/maintenance-records/:id', authenticateUser, deleteMaintenanceRecord)

    return router
}

export default makeCarMaintenanceRouter
