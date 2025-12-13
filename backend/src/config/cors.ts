import { CorsOptions } from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const DEFAULT_ALLOWED_ORIGINS = [
    'https://meclogger.com',
    'https://www.meclogger.com',
    'https://api.meclogger.com',
    'http://localhost:5173',
    'http://localhost:8080',
    'http://localhost:9000'
]

const parseOrigins = (raw?: string | null): string[] => {
    if (!raw) return []
    return raw
        .split(/[,\\s]+/) // allow comma or whitespace separated lists
        .map(origin => origin.trim())
        .filter(Boolean)
}

const allowAll = String(process.env.CORS_ALLOW_ALL || '').toLowerCase() === 'true'

const allowedOrigins = (() => {
    const fromEnv = parseOrigins(process.env.CORS_ALLOWED_ORIGINS)
    if (fromEnv.length) return fromEnv
    return DEFAULT_ALLOWED_ORIGINS
})()

export const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
        if (allowAll) {
            return callback(null, true)
        }
        // Allow non-browser clients (no origin) and any explicitly allowed origin.
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true)
        }
        // Fallback: disallow origin without crashing the server.
        callback(null, false)
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 200,
    maxAge: 86400
}

export const allowedOriginsList = allowedOrigins
