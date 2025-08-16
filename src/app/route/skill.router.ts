import { Router } from 'express'
import skillControls from '../controller/skill.controller'

const router = Router()
router.post('/add', skillControls.addSkill)
const skillRoutes = router
export default skillRoutes
