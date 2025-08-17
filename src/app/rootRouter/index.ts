import { Router } from 'express'
import AuthRouter from '../route/auth.router'
import CourseRouter from '../route/course.router'
import ModuleRouter from '../route/module.router'
import LectureRouter from '../route/lecture.router'
import { authorize } from '../helpers/authorize'
import { UserRole } from '../enum'
type AppRoute = {
    path: string
    route: Router
    middleware?: any[]
}
const router = Router()
const routes: AppRoute[] = [
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
        middleware: [authorize(UserRole.Admin)],
    },
    {
        path: '/lectures',
        route: LectureRouter,
        middleware: [authorize(UserRole.Admin)],
    },
]

// Apply
routes.map((r) => {
    if (r.middleware) {
        router.use(r.path, r.middleware, r.route)
    } else {
        router.use(r.path, r.route)
    }
})

export default router
