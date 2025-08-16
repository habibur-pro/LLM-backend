import { Router } from 'express'
import AuthController from '../controller/auth.controller'
import CourseController from '../controller/course.controller'
import { cloudinaryUploader } from '../helpers/cloudinaryUploader'

const router = Router()
router.get('/', CourseController.getAllCourse)
router.get('/:slugOrId', CourseController.getCourseBySlugAndId)
router.patch(
    '/:slugOrId',
    cloudinaryUploader('thumbnail'),
    CourseController.updateCourse
)
router.post('/', cloudinaryUploader('thumbnail'), CourseController.addCourse)
const CourseRouter = router
export default CourseRouter
