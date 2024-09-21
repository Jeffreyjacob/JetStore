"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../utils/AppError"));
const zod_1 = require("zod");
const jsonwebtoken_1 = require("jsonwebtoken");
const client_1 = require("@prisma/client");
const handleAppError = (err, res) => {
    return res.status(err.statusCode).json({
        status: "fail",
        message: err.message
    });
};
const handleZodError = (err, res) => {
    console.log("zodError", err);
    return res.status(400).json({
        status: "fail",
        message: "Validation Error",
        error: err.issues.map((error) => ({
            path: error.path.join(","),
            error: error.message
        }))
    });
};
const handleTokenExpired = (err, res) => {
    return res.status(401).json({
        status: "fail",
        message: err.message
    });
};
const handlePrismaError = (err, res) => {
    return res.status(404).json({
        status: "fail",
        message: err.meta || err.message
    });
};
const ErrorHandler = (err, req, res, next) => {
    if (err instanceof zod_1.ZodError) {
        return handleZodError(err, res);
    }
    if (err instanceof AppError_1.default) {
        return handleAppError(err, res);
    }
    if (err instanceof client_1.Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
        return handlePrismaError(err, res);
    }
    if (err instanceof jsonwebtoken_1.TokenExpiredError) {
        return handleTokenExpired(err, res);
    }
    return res.status(500).json({
        status: "fail",
        message: "Something went wrong"
    });
};
exports.default = ErrorHandler;
