"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = __importDefault(require("../controller/user.controller"));
const authorize_1 = require("../helpers/authorize");
const enum_1 = require("../enum");
const router = (0, express_1.Router)();
router.get('/', user_controller_1.default.getAllStudent);
router.get('/instructors', user_controller_1.default.getAllInstructor);
router.patch('/:userId', (0, authorize_1.authorize)(enum_1.UserRole.Admin, enum_1.UserRole.Student), user_controller_1.default.updateUser);
const UserRouter = router;
exports.default = UserRouter;
