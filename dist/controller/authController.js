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
exports.LogOutHandler = exports.ResetPasswordHandler = exports.ForgetPasswordHandler = exports.LoginHandler = exports.SignUpHandler = void 0;
const client_1 = require("@prisma/client");
const userSchema_1 = require("../schema/userSchema");
const AppError_1 = __importDefault(require("../utils/AppError"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const generateToken_1 = require("../utils/generateToken");
const generateCookie_1 = require("../utils/generateCookie");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sendMail_1 = __importDefault(require("../utils/sendMail"));
const prismaClient = new client_1.PrismaClient();
const SignUpHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const request = userSchema_1.SignupSchema.parse(req.body);
    const { fullName, email, password, role } = request;
    const existingEmail = yield prismaClient.user.findFirst({ where: { email } });
    if (existingEmail) {
        throw new AppError_1.default("Email already exist", 401);
    }
    const hashPassword = yield bcryptjs_1.default.hashSync(password, 10);
    const user = yield prismaClient.user.create({
        data: {
            fullname: fullName,
            email,
            password: hashPassword,
            role: role
        },
        include: {
            address: true,
            store: true,
            cart: { include: { product: true } }
        }
    });
    const token = (0, generateToken_1.GenerateToken)(user);
    (0, generateCookie_1.GenerateCookie)(token, res);
    return res.status(201).json(Object.assign(Object.assign({}, user), { password: undefined }));
});
exports.SignUpHandler = SignUpHandler;
const LoginHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const request = userSchema_1.LoginSchema.parse(req.body);
    const { email, password } = request;
    const user = yield prismaClient.user.findFirst({
        where: { email },
        include: {
            address: true,
            store: true,
            cart: { include: { product: true } }
        }
    });
    if (!user) {
        throw new AppError_1.default("invalid credentails", 401);
    }
    const matchPassword = yield bcryptjs_1.default.compareSync(password, user.password);
    if (!matchPassword) {
        throw new AppError_1.default("invalid credentials", 401);
    }
    const token = (0, generateToken_1.GenerateToken)(user);
    (0, generateCookie_1.GenerateCookie)(token, res);
    return res.status(200).json(Object.assign(Object.assign({}, user), { password: undefined }));
});
exports.LoginHandler = LoginHandler;
const ForgetPasswordHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const request = userSchema_1.ForgetPasswordSchem.parse(req.body);
    const { email } = request;
    const findUser = yield prismaClient.user.findFirst({
        where: { email }
    });
    if (!findUser) {
        throw new AppError_1.default("User does not exist", 401);
    }
    const resetToken = jsonwebtoken_1.default.sign({ id: findUser.id }, process.env.JWT_SECRET, {
        expiresIn: "15m"
    });
    const user = yield prismaClient.user.update({
        where: {
            id: findUser.id
        },
        data: {
            resetToken
        }
    });
    const resetUrl = `${process.env.FRONTENDURL}/resetpassword/${resetToken}`;
    const message = ` <h1>You have a required a password reset</h1>
                            <p>Please go to this link to reset your password</p>
                            <a href=${resetUrl} clicktracking=off>${resetUrl}</a>`;
    try {
        yield (0, sendMail_1.default)({
            to: findUser.email,
            subject: "Password Reset Request",
            text: message
        });
        return res.json({ message: "Email Reset link has been sent" });
    }
    catch (error) {
        console.log(error);
        yield prismaClient.user.update({
            where: { id: findUser.id },
            data: { resetToken: undefined }
        });
        return { message: "Email was not sent" };
    }
});
exports.ForgetPasswordHandler = ForgetPasswordHandler;
const ResetPasswordHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const request = userSchema_1.ResetpasswordSchema.parse(req.body);
    const { password } = request;
    const { resetToken } = req.params;
    const checkTokenValidity = yield jsonwebtoken_1.default.verify(resetToken, process.env.JWT_SECRET);
    const hashPassword = yield bcryptjs_1.default.hashSync(password, 10);
    const user = yield prismaClient.user.update({
        where: { id: checkTokenValidity.id },
        data: {
            resetToken: null,
            password: hashPassword
        }
    });
    if (!user) {
        throw new AppError_1.default("user not found", 404);
    }
    res.status(200).json({
        message: "Password Reset Successfully!"
    });
});
exports.ResetPasswordHandler = ResetPasswordHandler;
const LogOutHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.cookie("token", "", { maxAge: 0 });
    res.status(200).json({
        success: true,
        message: "Logout Successfully!"
    });
});
exports.LogOutHandler = LogOutHandler;
