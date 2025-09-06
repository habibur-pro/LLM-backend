import express from 'express'
import cors from 'cors'
import globalErrorHandler from './helpers/globalErrorHandler'
import handleNotFound from './helpers/handleNotFound'
import morgan from 'morgan'
import router from './rootRouter'
import config from './config'
import cookieParser from 'cookie-parser'

// initialize app
const app = express()
// Allow specific origin and credentials
app.use(
    cors({
        origin: config.cors_domain, // your frontend origin
        credentials: true, // allow cookies/auth headers
    })
)
//  Parse cookies
app.use(cookieParser())
app.use(express.json())
// logger
app.use(morgan('dev'))
// main route
app.use('/api/v1', router)
// test route
app.get('/', (req, res) => {
    res.status(200).json({ message: 'application is running' })
})
app.use(handleNotFound)
app.use(globalErrorHandler)

export default app
