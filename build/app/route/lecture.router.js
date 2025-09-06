"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const lecture_controller_1 = __importDefault(require("../controller/lecture.controller"));
const cloudinaryUploader_1 = require("../helpers/cloudinaryUploader");
const router = (0, express_1.Router)();
router.patch('/:lectureId', (0, cloudinaryUploader_1.cloudinaryUploader)(['video']), lecture_controller_1.default.updateLecture);
router.delete('/:lectureId', lecture_controller_1.default.deleteLecture);
router.get('/', lecture_controller_1.default.getLecturesWithFilters);
const LectureRouter = router;
exports.default = LectureRouter;
