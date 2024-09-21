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
exports.CheckRole = exports.VerifyToken = void 0;
const AppError_1 = __importDefault(require("../utils/AppError"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const prismaClient = new client_1.PrismaClient();
const VerifyToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.cookies.token;
        if (!token) {
            throw new AppError_1.default("token is required", 401);
        }
        const decoded = yield jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = yield prismaClient.user.findFirst({
            where: { id: decoded.id }
        });
        if (!user) {
            throw new AppError_1.default("user not found", 404);
        }
        req.user = user;
        next();
    }
    catch (error) {
        console.log(error);
        next(error);
    }
});
exports.VerifyToken = VerifyToken;
const CheckRole = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (user.role === "SELLER") {
            next();
        }
        else {
            throw new AppError_1.default("User is not an admin and not authorized", 401);
        }
    }
    catch (error) {
        console.log(error);
        next(error);
    }
});
exports.CheckRole = CheckRole;
