import { Router } from 'express'
import ModuleController from '../controller/module.controller'

const router = Router()
router.patch('/:moduleId', ModuleController.updateModule)
router.post('/:moduleId/lectures', ModuleController.addLecture)
router.delete('/:moduleId', ModuleController.deleteModule)
const ModuleRouter = router
export default ModuleRouter
