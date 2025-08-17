import { Router } from 'express'
import AuthRouter from '../route/auth.router'
import CourseRouter from '../route/course.router'
import ModuleRouter from '../route/module.router'
import LectureRouter from '../route/lecture.router'

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
    {
        path: '/modules',
        route: ModuleRouter,
    },
    {
        path: '/lectures',
        route: LectureRouter,
    },
]

routes.map((route) => router.use(route.path, route.route))

export default router
