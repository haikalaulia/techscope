"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOtp = generateOtp;
function generateOtp(lenght = 6) {
    const digit = "0123456789";
    let otp = "";
    for (let i = 0; i < lenght; i++) {
        otp += digit[Math.floor(Math.random() * 10)];
    }
    return otp;
}
