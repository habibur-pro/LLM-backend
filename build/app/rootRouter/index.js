"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_router_1 = __importDefault(require("../route/auth.router"));
const course_router_1 = __importDefault(require("../route/course.router"));
const module_router_1 = __importDefault(require("../route/module.router"));
const lecture_router_1 = __importDefault(require("../route/lecture.router"));
const authorize_1 = require("../helpers/authorize");
const enum_1 = require("../enum");
const watchHistory_router_1 = __importDefault(require("../route/watchHistory.router"));
const order_router_1 = __importDefault(require("../route/order.router"));
const payment_router_1 = __importDefault(require("../route/payment.router"));
const user_router_1 = __importDefault(require("../route/user.router"));
const myCourse_router_1 = __importDefault(require("../route/myCourse.router"));
const router = (0, express_1.Router)();
const routes = [
    {
        path: '/auth',
        route: auth_router_1.default,
    },
    {
        path: '/users',
        route: user_router_1.default,
    },
    {
        path: '/courses',
        route: course_router_1.default,
    },
    {
        path: '/modules',
        route: module_router_1.default,
        middleware: [(0, authorize_1.authorize)(enum_1.UserRole.Admin)],
    },
    {
        path: '/lectures',
        route: lecture_router_1.default,
        middleware: [(0, authorize_1.authorize)(enum_1.UserRole.Admin)],
    },
    {
        path: '/watch-history',
        route: watchHistory_router_1.default,
    },
    {
        path: '/orders',
        route: order_router_1.default,
    },
    {
        path: '/payments',
        route: payment_router_1.default,
    },
    {
        path: '/my-classes',
        route: myCourse_router_1.default,
        middleware: [(0, authorize_1.authorize)(enum_1.UserRole.Student, enum_1.UserRole.Admin)],
    },
];
// Apply
routes.map((r) => {
    if (r.middleware) {
        router.use(r.path, r.middleware, r.route);
    }
    else {
        router.use(r.path, r.route);
    }
});
exports.default = router;
