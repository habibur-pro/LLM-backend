"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOtpHtml = void 0;
const generateOtpHtml = (name, otp) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
            background-color: #f8f9fa;
            margin: 0;
            padding: 0;
            color: #343a40;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            text-align: center;
            background-color: #007bff; /* Primary brand color */
            padding: 30px 20px;
            color: #ffffff;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .content {
            padding: 30px;
            text-align: center;
        }
        .content h2 {
            font-size: 20px;
            font-weight: 500;
            margin-top: 0;
            color: #495057;
        }
        .content p {
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 20px;
        }
        .otp-box {
            background-color: #e9ecef;
            color: #007bff;
            font-size: 32px;
            font-weight: 700;
            padding: 15px 30px;
            margin: 20px auto;
            border-radius: 6px;
            display: inline-block;
            letter-spacing: 4px;
            border: 1px solid #ced4da;
        }
        .otp-expiry {
            font-size: 14px;
            color: #6c757d;
            margin-top: 15px;
        }
        .footer {
            text-align: center;
            padding: 20px;
            background-color: #f1f1f1;
            font-size: 12px;
            color: #6c757d;
            border-top: 1px solid #e9ecef;
        }
        .footer a {
            color: #007bff;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Test School</h1>
        </div>
        <div class="content">
            <h2>Email Verification</h2>
            <p>Hello ${name},</p>
            <p>Thank you for registering with Test School. Please use the following code to verify your email address and complete your registration.</p>
            <div class="otp-box">${otp}</div>
            <p class="otp-expiry">This code is valid for 10 minutes.</p>
            <p>If you did not request this verification, please ignore this email.</p>
        </div>
        <div class="footer">
            <p>&copy; 2025 Test School. All rights reserved.</p>
            <p><a href="#">Contact Support</a> | <a href="#">Unsubscribe</a></p>
        </div>
    </div>
</body>
</html>`;
};
exports.generateOtpHtml = generateOtpHtml;
