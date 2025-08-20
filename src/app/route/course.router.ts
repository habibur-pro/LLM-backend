import { Router } from 'express'
import AuthController from '../controller/auth.controller'
import CourseController from '../controller/course.controller'
import { cloudinaryUploader } from '../helpers/cloudinaryUploader'
import { authorize } from '../helpers/authorize'
import { UserRole } from '../enum'

const router = Router()
router.get('/', CourseController.getAllCourse)
router.get('/:slugOrId/modules', CourseController.getModuleOfCourse)
router.post(
    '/:slugOrId/modules',
    // authorize(UserRole.Admin),
    CourseController.addCourseModule
)
router.get('/:slugOrId', CourseController.getCourseBySlugAndId)
router.patch(
    '/:slugOrId',
    authorize(UserRole.Admin),
    cloudinaryUploader(['thumbnail', 'coverPhoto']),
    CourseController.updateCourse
)
router.post(
    '/',
    // authorize(UserRole.Admin),
    cloudinaryUploader(['thumbnail', 'coverPhoto']),
    CourseController.addCourse
)
const CourseRouter = router
export default CourseRouter
