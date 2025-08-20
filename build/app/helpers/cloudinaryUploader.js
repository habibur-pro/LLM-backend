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
exports.cloudinaryUploader = void 0;
/* eslint-disable @typescript-eslint/no-namespace */
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const cloudinaryConfig_1 = __importDefault(require("../config/cloudinaryConfig"));
// ✅ Multer memory storage (for buffer)
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
// ✅ Upload a buffer to Cloudinary
const uploadToCloudinary = (fileBuffer_1, mimetype_1, ...args_1) => __awaiter(void 0, [fileBuffer_1, mimetype_1, ...args_1], void 0, function* (fileBuffer, mimetype, folder = 'minimal-LLM') {
    const base64 = `data:${mimetype};base64,${fileBuffer.toString('base64')}`;
    const result = yield cloudinaryConfig_1.default.uploader.upload(base64, {
        folder,
        resource_type: 'auto',
    });
    return result.secure_url;
});
/**
 * ✅ Reusable Cloudinary uploader middleware
 * @param fields Array of field names you want to upload
 * @param folder Cloudinary folder to save files
 */
const cloudinaryUploader = (fields = ['file'], folder = 'minimal-LLM') => {
    const multerHandler = upload.fields(fields.map((name) => ({ name, maxCount: 1 })));
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        multerHandler(req, res, (err) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            if (err)
                return res.status(400).json({ error: err.message });
            try {
                const uploadedFiles = {};
                for (const fieldName of fields) {
                    const fileArray = (_a = req.files) === null || _a === void 0 ? void 0 : _a[fieldName];
                    if (fileArray && fileArray.length > 0) {
                        const file = fileArray[0];
                        const url = yield uploadToCloudinary(file.buffer, file.mimetype, folder);
                        const extension = path_1.default
                            .extname(file.originalname)
                            .replace('.', '');
                        uploadedFiles[fieldName] = {
                            filename: file.originalname,
                            extension,
                            size: file.size,
                            url,
                        };
                    }
                }
                req.uploadedFiles = uploadedFiles;
                next();
            }
            catch (uploadErr) {
                console.error('Cloudinary upload failed:', uploadErr);
                res.status(500).json({ error: 'Cloudinary upload failed' });
            }
        }));
    });
};
exports.cloudinaryUploader = cloudinaryUploader;
