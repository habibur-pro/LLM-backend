import { Router } from 'express'
import AuthRouter from '../route/auth.router'
import CourseRouter from '../route/course.router'

const router = Router()
const routes = [
    {
        path: '/auth',
        route: AuthRouter,
    },
    {
        path: '/courses',
        route: CourseRouter,
    },
]

routes.map((route) => router.use(route.path, route.route))

export default router
