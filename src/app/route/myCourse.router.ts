import { Router } from 'express'
import MyClassController from '../controller/myClass.controller'

const router = Router()
router.get('/', MyClassController.getMyClasses)
router.get('/:classId', MyClassController.singleClassProgress)
router.post('/:classId/next', MyClassController.nextLecture)
router.post('/:classId/prev', MyClassController.previousLecture)
router.patch('/:classId/set-current', MyClassController.setCurrentLecture)
const MyClassRouter = router
export default MyClassRouter
