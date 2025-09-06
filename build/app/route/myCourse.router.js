"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const myClass_controller_1 = __importDefault(require("../controller/myClass.controller"));
const router = (0, express_1.Router)();
router.get('/', myClass_controller_1.default.getMyClasses);
router.get('/:classId', myClass_controller_1.default.singleClassProgress);
router.post('/:classId/next', myClass_controller_1.default.nextLecture);
router.post('/:classId/prev', myClass_controller_1.default.previousLecture);
router.patch('/:classId/set-current', myClass_controller_1.default.setCurrentLecture);
const MyClassRouter = router;
exports.default = MyClassRouter;
