import { Router } from 'express'
import AuthController from '../controller/auth.controller'

const router = Router()
router.post('/signup', AuthController.signup)
router.post('/signin', AuthController.signIn)
router.post('/verify-signin', AuthController.verifySignin)
router.post('/refresh', AuthController.refreshToken)
const AuthRouter = router
export default AuthRouter
