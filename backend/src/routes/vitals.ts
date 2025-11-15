import { RequestHandler, Router } from 'express'
import { PrismaClient } from '@prisma/client'
import {
    createBloodPressureRecord,
    createBloodSugarRecord,
    createBodyWeightRecord,
    getBodyWeightRecords,
    getBloodPressureRecords,
    getBloodSugarRecords
} from '../controller/vitalsController'

const makeVitalsRouter = (
    _dbClient: PrismaClient,
    authenticateUser: RequestHandler
): Router => {
    const router = Router()

    router.post('/blood-pressure', authenticateUser, createBloodPressureRecord)
    router.get('/blood-pressure', authenticateUser, getBloodPressureRecords)
    router.post('/blood-sugar', authenticateUser, createBloodSugarRecord)
    router.get('/blood-sugar', authenticateUser, getBloodSugarRecords)
    router.post('/body-weight', authenticateUser, createBodyWeightRecord)
    router.get('/body-weight', authenticateUser, getBodyWeightRecords)

    return router
}

export default makeVitalsRouter
