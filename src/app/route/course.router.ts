import { Router } from 'express'
import AuthController from '../controller/auth.controller'
import CourseController from '../controller/course.controller'

const router = Router()
router.get('/', CourseController.getAllCourse)
router.get('/:slugOrId', CourseController.getCourseBySlugAndId)
router.patch('/:slugOrId', CourseController.updateCourse)
router.post('/', CourseController.addCourse)
const CourseRouter = router
export default CourseRouter
