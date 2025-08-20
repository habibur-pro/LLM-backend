"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const course_controller_1 = __importDefault(require("../controller/course.controller"));
const cloudinaryUploader_1 = require("../helpers/cloudinaryUploader");
const authorize_1 = require("../helpers/authorize");
const enum_1 = require("../enum");
const router = (0, express_1.Router)();
router.get('/', course_controller_1.default.getAllCourse);
router.get('/:slugOrId/modules', course_controller_1.default.getModuleOfCourse);
router.post('/:slugOrId/modules', 
// authorize(UserRole.Admin),
course_controller_1.default.addCourseModule);
router.get('/:slugOrId', course_controller_1.default.getCourseBySlugAndId);
router.patch('/:slugOrId', (0, authorize_1.authorize)(enum_1.UserRole.Admin), (0, cloudinaryUploader_1.cloudinaryUploader)(['thumbnail', 'coverPhoto']), course_controller_1.default.updateCourse);
router.post('/', 
// authorize(UserRole.Admin),
(0, cloudinaryUploader_1.cloudinaryUploader)(['thumbnail', 'coverPhoto']), course_controller_1.default.addCourse);
const CourseRouter = router;
exports.default = CourseRouter;
