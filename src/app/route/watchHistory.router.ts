import { Router } from 'express'
import ModuleController from '../controller/module.controller'
import WatchHistoryController from '../controller/watchHistory.controller'

const router = Router()
router.post('/', WatchHistoryController.createWatchHistory)
const WatchHistoryRouter = router
export default WatchHistoryRouter
