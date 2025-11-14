import { RequestHandler, Router }from 'express'
import { Prisma, PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import * as dotenv from 'dotenv'
import { ExtendedRequest } from '../../extendedRequest'
import {
    login,
    register,
    getProfile
} from '../controller/authController'

dotenv.config()

const makeRouter = (
    dbClient: PrismaClient,
    authenticateUser: RequestHandler
): Router => {
    const router = Router()

    // Login
    router.post('/login', login)

    // Register
    router.post('/register', register)

    // Get Profile
    router.get('/profile', authenticateUser, getProfile)

  
    return router
}

export default makeRouter