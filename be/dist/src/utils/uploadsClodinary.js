"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
const stream_1 = require("stream");
const dotenv_1 = __importDefault(require("dotenv"));
const path = require("path");
dotenv_1.default.config();
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;
cloudinary_1.v2.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
});
const uploadCloudinary = async (buffer, folder, originalname) => {
    const ext = path.extname(originalname).toLowerCase();
    const filename = path.basename(originalname, ext); // Tanpa ekstensi
    const isImage = [".jpg", ".jpeg", ".png", ".webp"].includes(ext);
    const resource_type = isImage ? "image" : "raw";
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary_1.v2.uploader.upload_stream({
            folder,
            resource_type,
            public_id: filename,
            format: ext.replace(".", ""),
            use_filename: true,
            unique_filename: true,
        }, (err, result) => {
            if (err || !result)
                return reject(err);
            resolve(result);
        });
        stream_1.Readable.from(buffer).pipe(uploadStream);
    });
};
exports.uploadCloudinary = uploadCloudinary;
