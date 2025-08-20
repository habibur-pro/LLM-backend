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
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, morgan_1.default)('dev'));
app.use('/api/v1', rootRouter_1.default);
app.get('/', (req, res) => {
    res.status(200).json({ message: 'application is running' });
});
app.use(handleNotFound_1.default);
app.use(globalErrorHandler_1.default);
exports.default = app;
