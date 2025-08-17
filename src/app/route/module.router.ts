import { Router } from 'express'
import ModuleController from '../controller/module.controller'

const router = Router()
router.patch('/:moduleId', ModuleController.updateModule)
router.post('/:moduleId/lecture', ModuleController.addLecture)
const ModuleRouter = router
export default ModuleRouter
