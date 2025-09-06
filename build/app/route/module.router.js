"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const module_controller_1 = __importDefault(require("../controller/module.controller"));
const router = (0, express_1.Router)();
router.patch('/:moduleId', module_controller_1.default.updateModule);
router.post('/:moduleId/lectures', module_controller_1.default.addLecture);
router.delete('/:moduleId', module_controller_1.default.deleteModule);
const ModuleRouter = router;
exports.default = ModuleRouter;
