import { Router } from 'express'
import MyClassController from '../controller/myClass.controller'

const router = Router()
router.get('/', MyClassController.getMyClasses)
router.get('/:classId', MyClassController.singleClassProgress)
router.post('/:classId/next', MyClassController.nextLecture)
router.post('/:classId/prev', MyClassController.previousLecture)
const MyClassRouter = router
export default MyClassRouter
