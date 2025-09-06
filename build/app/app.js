"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const globalErrorHandler_1 = __importDefault(require("./helpers/globalErrorHandler"));
const handleNotFound_1 = __importDefault(require("./helpers/handleNotFound"));
const morgan_1 = __importDefault(require("morgan"));
const rootRouter_1 = __importDefault(require("./rootRouter"));
const config_1 = __importDefault(require("./config"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
// initialize app
const app = (0, express_1.default)();
// Allow specific origin and credentials
app.use((0, cors_1.default)({
    origin: config_1.default.cors_domain, // your frontend origin
    credentials: true, // allow cookies/auth headers
}));
//  Parse cookies
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
// logger
app.use((0, morgan_1.default)('dev'));
// main route
app.use('/api/v1', rootRouter_1.default);
// test route
app.get('/', (req, res) => {
    res.status(200).json({ message: 'application is running' });
});
app.use(handleNotFound_1.default);
app.use(globalErrorHandler_1.default);
exports.default = app;
