import { Router } from 'express'
import OrderController from '../controller/order.controller'
import UserController from '../controller/user.controller'
import { authorize } from '../helpers/authorize'
import { UserRole } from '../enum'

const router = Router()
router.get('/', UserController.getAllStudent)
router.get('/instructors', UserController.getAllInstructor)
router.patch(
    '/:userId',
    authorize(UserRole.Admin, UserRole.Student),
    UserController.updateUser
)

const UserRouter = router
export default UserRouter
