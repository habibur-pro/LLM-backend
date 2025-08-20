"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const idGenerator_1 = __importDefault(require("../helpers/idGenerator"));
const enum_1 = require("../enum");
const UserSchema = new mongoose_1.Schema({
    id: {
        type: String,
        required: [true, 'id is required'],
        unique: true,
    },
    name: {
        type: String,
        trim: true,
        required: [true, 'full name is required'],
    },
    email: {
        type: String,
        required: [true, 'email is required'],
        unique: true,
    },
    phone: {
        type: String,
        required: [true, 'phone is required'],
        unique: true,
    },
    password: {
        type: String,
        required: [true, 'phone is required'],
        minlength: 6,
    },
    role: {
        type: String,
        enum: Object.values(enum_1.UserRole),
        default: enum_1.UserRole.Student,
    },
}, { timestamps: true });
UserSchema.pre('validate', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.id) {
            this.id = yield (0, idGenerator_1.default)(this.constructor);
        }
        next();
    });
});
const User = (0, mongoose_1.model)('user', UserSchema);
exports.default = User;
