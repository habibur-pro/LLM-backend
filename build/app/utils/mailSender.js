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
exports.mailSender = mailSender;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = __importDefault(require("../config"));
const getErrorMessage_1 = require("../helpers/getErrorMessage");
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: config_1.default.mailer_name,
        pass: config_1.default.mailer_pass,
    },
});
/**
 * Sends an email with optional attachments.
 * @param options Mail options
 * @returns Promise resolving to the messageId string
 * @throws Error if sending fails
 */
function mailSender(options) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(config_1.default.mailer_name, config_1.default.mailer_pass);
        const { to, subject, text, html, attachments } = options;
        if (!to || !subject) {
            throw new Error('Missing required email parameters: to, subject, and text');
        }
        const mailOptions = {
            from: '"Test School" <va.habibur@gmail.com>',
            to,
            subject,
            text,
            html,
            attachments,
        };
        try {
            const info = yield transporter.sendMail(mailOptions);
            return info.messageId;
        }
        catch (error) {
            console.error('mailSender error:', error);
            throw new Error((0, getErrorMessage_1.getErrorMessage)(error));
        }
    });
}
