import { Router } from 'express'
import LectureController from '../controller/lecture.controller'
import { cloudinaryUploader } from '../helpers/cloudinaryUploader'

const router = Router()
router.patch(
    '/:lectureId',
    cloudinaryUploader(['video']),
    LectureController.updateLecture
)
router.delete('/:lectureId', LectureController.deleteLecture)
const LectureRouter = router
export default LectureRouter
