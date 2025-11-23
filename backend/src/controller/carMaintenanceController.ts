import prisma from '../../lib/prisma'
import { Request, Response } from 'express'
import { MaintenanceType } from '@prisma/client'

const ensureUser = (req: any, res: Response) => {
    if (!req.user) {
        res.status(401).json({
            status: 401,
            message: 'Unauthorized'
        })
        return null
    }
    return req.user
}

export const addVehicle = async(req: Request, res: Response) => {
    const user = ensureUser(req, res)
    if (!user) return

    const {
        make,
        model,
        year,
        color,
        licensePlate,
        registrationExpiryDate,
        vin,
        vehicleType = 'CAR',
        purchaseDate,
        currentMileage,
        imageUrl,
        notes
    } = req.body || {}
    const uploadedImage = (req as any).file

    if (!make || !model) {
        return res.status(400).json({
            status: 400,
            message: 'make and model are required'
        })
    }

    const resolvedImageUrl = uploadedImage
        ? `/vehicles/${uploadedImage.filename}`
        : imageUrl || null

    try {
        const vehicle = await prisma.vehicle.create({
            data: {
                userId: user.id,
                make,
                model,
                year: year ? Number(year) : null,
                color: color || null,
                licensePlate: licensePlate || null,
                registrationExpiryDate: registrationExpiryDate ? new Date(registrationExpiryDate) : null,
                vin: vin || null,
                vehicleType,
                purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
                currentMileage: currentMileage ? Number(currentMileage) : null,
                imageUrl: resolvedImageUrl,
                notes: notes || null
            }
        })

        return res.status(201).json({
            status: 201,
            vehicle
        })
    } catch (error: any) {
        const message = error?.message || 'Unable to create vehicle'
        return res.status(500).json({
            status: 500,
            message
        })
    }
}

export const getVehicle = async(req: Request, res: Response) => {
    const user = ensureUser(req, res)
    if (!user) return
    const { id } = req.params
    try {
        const vehicle = await prisma.vehicle.findFirst({
            where: {
                id,
                userId: user.id
            }
        })
        if (!vehicle) {
            return res.status(404).json({
                status: 404,
                message: 'Vehicle not found'
            })
        }
        return res.status(200).json({
            status: 200,
            vehicle
        })
    } catch (error: any) {
        return res.status(500).json({
            status: 500,
            message: error?.message || 'Unable to fetch vehicle'
        })
    }
}

export const updateVehicle = async(req: Request, res: Response) => {
    const user = ensureUser(req, res)
    if (!user) return
    const { id } = req.params
    const {
        make,
        model,
        year,
        color,
        licensePlate,
        registrationExpiryDate,
        vin,
        vehicleType = 'CAR',
        purchaseDate,
        currentMileage,
        imageUrl,
        notes
    } = req.body || {}
    const uploadedImage = (req as any).file

    try {
        const existing = await prisma.vehicle.findFirst({
            where: { id, userId: user.id }
        })
        if (!existing) {
            return res.status(404).json({
                status: 404,
                message: 'Vehicle not found'
            })
        }
        const resolvedImageUrl = uploadedImage
            ? `/vehicles/${uploadedImage.filename}`
            : imageUrl || existing.imageUrl || null

        const vehicle = await prisma.vehicle.update({
            where: { id },
            data: {
                make: make ?? existing.make,
                model: model ?? existing.model,
                year: year !== undefined ? Number(year) : existing.year,
                color: color ?? existing.color,
                licensePlate: licensePlate ?? existing.licensePlate,
                registrationExpiryDate: registrationExpiryDate ? new Date(registrationExpiryDate) : existing.registrationExpiryDate,
                vin: vin ?? existing.vin,
                vehicleType: vehicleType || existing.vehicleType,
                purchaseDate: purchaseDate ? new Date(purchaseDate) : existing.purchaseDate,
                currentMileage: currentMileage !== undefined && currentMileage !== null
                    ? Number(currentMileage)
                    : existing.currentMileage,
                imageUrl: resolvedImageUrl,
                notes: notes ?? existing.notes
            }
        })
        return res.status(200).json({
            status: 200,
            vehicle
        })
    } catch (error: any) {
        return res.status(500).json({
            status: 500,
            message: error?.message || 'Unable to update vehicle'
        })
    }
}

export const listVehicles = async(req: Request, res: Response) => {
    const user = ensureUser(req, res)
    if (!user) return

    try {
        const vehicles = await prisma.vehicle.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' }
        })
        return res.status(200).json({
            status: 200,
            vehicles
        })
    } catch (error: any) {
        return res.status(500).json({
            status: 500,
            message: error?.message || 'Unable to fetch vehicles'
        })
    }
}

export const listMaintenanceRecords = async(req: Request, res: Response) => {
    const user = ensureUser(req, res)
    if (!user) return

    const vehicleId = req.query.vehicleId as string | undefined

    try {
        const ownedVehicles = await prisma.vehicle.findMany({
            where: { userId: user.id },
            select: { id: true }
        })
        const ownedIds = ownedVehicles.map(v => v.id)
        if (vehicleId && !ownedIds.includes(vehicleId)) {
            return res.status(404).json({
                status: 404,
                message: 'Vehicle not found for current user'
            })
        }
        const filterIds = vehicleId ? [vehicleId] : ownedIds
        const records = await prisma.maintenanceRecord.findMany({
            where: {
                vehicleId: { in: filterIds }
            },
            orderBy: { serviceDate: 'desc' }
        })

        return res.status(200).json({
            status: 200,
            records
        })
    } catch (error: any) {
        console.error('listMaintenanceRecords error', error)
        return res.status(500).json({
            status: 500,
            message: error?.message || 'Unable to fetch maintenance records'
        })
    }
}

export const addMaintenanceRecord = async(req: Request, res: Response) => {
    const user = ensureUser(req, res)
    if (!user) return

    const {
        vehicleId,
        maintenanceType = 'OTHER',
        title,
        description,
        serviceDate,
        mileageAtService,
        servicedBy,
        location,
        cost,
        currency = 'USD',
        partsUsed,
        laborHours,
        receiptUrl,
        tags
    } = req.body || {}

    if (!vehicleId || !title || !serviceDate) {
        return res.status(400).json({
            status: 400,
            message: 'vehicleId, title, and serviceDate are required'
        })
    }

    const vehicle = await prisma.vehicle.findFirst({
        where: {
            id: vehicleId,
            userId: user.id
        }
    })

    if (!vehicle) {
        return res.status(404).json({
            status: 404,
            message: 'Vehicle not found for current user'
        })
    }

    const normalizeType = (raw: any) => {
        if (!raw) return MaintenanceType.OTHER
        const candidate = String(raw).trim().toUpperCase().replace(/[\s-]+/g, '_')
        return Object.values(MaintenanceType).includes(candidate as MaintenanceType)
            ? (candidate as MaintenanceType)
            : MaintenanceType.OTHER
    }

    try {
        const record = await prisma.maintenanceRecord.create({
            data: {
                vehicleId,
                maintenanceType: normalizeType(maintenanceType),
                title,
                description: description || null,
                serviceDate: new Date(serviceDate),
                mileageAtService: mileageAtService ? Number(mileageAtService) : null,
                servicedBy: servicedBy || null,
                location: location || null,
                cost: cost !== undefined && cost !== null ? Number(cost) : null,
                currency: currency || 'USD',
                partsUsed: partsUsed || null,
                laborHours: laborHours ? Number(laborHours) : null,
                receiptUrl: receiptUrl || null,
                tags: Array.isArray(tags) ? tags : []
            }
        })

        return res.status(201).json({
            status: 201,
            record
        })
    } catch (error: any) {
        const message = error?.message || 'Unable to create maintenance record'
        return res.status(500).json({
            status: 500,
            message
        })
    }
}

export const getMaintenanceRecord = async(req: Request, res: Response) => {
    const user = ensureUser(req, res)
    if (!user) return
    const { id } = req.params
    try {
        const record = await prisma.maintenanceRecord.findFirst({
            where: {
                id,
                vehicle: {
                    userId: user.id
                }
            }
        })
        if (!record) {
            return res.status(404).json({
                status: 404,
                message: 'Maintenance record not found'
            })
        }
        return res.status(200).json({
            status: 200,
            record
        })
    } catch (error: any) {
        return res.status(500).json({
            status: 500,
            message: error?.message || 'Unable to fetch maintenance record'
        })
    }
}

export const deleteMaintenanceRecord = async(req: Request, res: Response) => {
    const user = ensureUser(req, res)
    if (!user) return
    const { id } = req.params
    try {
        const record = await prisma.maintenanceRecord.findFirst({
            where: {
                id,
                vehicle: {
                    userId: user.id
                }
            }
        })
        if (!record) {
            return res.status(404).json({
                status: 404,
                message: 'Maintenance record not found'
            })
        }
        await prisma.maintenanceRecord.delete({
            where: { id }
        })
        return res.status(200).json({
            status: 200,
            message: 'Maintenance record deleted'
        })
    } catch (error: any) {
        return res.status(500).json({
            status: 500,
            message: error?.message || 'Unable to delete maintenance record'
        })
    }
}
