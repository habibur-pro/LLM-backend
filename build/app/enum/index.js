"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseStatus = exports.PaymentStatus = exports.OrderStatus = exports.LectureContentType = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["Student"] = "student";
    UserRole["Admin"] = "admin";
    UserRole["instructor"] = "instructor";
})(UserRole || (exports.UserRole = UserRole = {}));
var LectureContentType;
(function (LectureContentType) {
    LectureContentType["Video"] = "video";
    LectureContentType["Pdf"] = "pdf";
    LectureContentType["Text"] = "text";
})(LectureContentType || (exports.LectureContentType = LectureContentType = {}));
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["COMPLETE"] = "complete";
    OrderStatus["PENDING"] = "pending";
    OrderStatus["PROCESSING"] = "processing";
    OrderStatus["CANCELED"] = "canceled";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["COMPLETE"] = "complete";
    PaymentStatus["PENDING"] = "pending";
    PaymentStatus["CANCELED"] = "canceled";
    PaymentStatus["FAILED"] = "failed";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var CourseStatus;
(function (CourseStatus) {
    CourseStatus["UPCOMING"] = "upcoming";
    CourseStatus["DRAFTED"] = "drafted";
    CourseStatus["PUBLISHED"] = "published";
    CourseStatus["UNPUBLISHED"] = "unPublished";
})(CourseStatus || (exports.CourseStatus = CourseStatus = {}));
