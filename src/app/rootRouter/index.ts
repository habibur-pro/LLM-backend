import { Router } from 'express'
import AuthRouter from '../route/auth.router'
import CourseRouter from '../route/course.router'
import ModuleRouter from '../route/module.router'
import LectureRouter from '../route/lecture.router'
import { authorize } from '../helpers/authorize'
import { UserRole } from '../enum'
import WatchHistoryRouter from '../route/watchHistory.router'
import OrderRouter from '../route/order.router'
import PaymentRouter from '../route/payment.router'
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
    {
        path: '/watch-history',
        route: WatchHistoryRouter,
    },
    {
        path: '/orders',
        route: OrderRouter,
    },
    {
        path: '/payments',
        route: PaymentRouter,
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
