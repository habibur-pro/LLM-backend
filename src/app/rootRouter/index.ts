import { Router } from 'express'
import AuthRouter from '../route/auth.router'

const router = Router()
const routes = [
    {
        path: '/auth',
        route: AuthRouter,
    },
]

routes.map((route) => router.use(route.path, route.route))

export default router
