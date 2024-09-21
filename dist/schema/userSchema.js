"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addressSchema = exports.UserSchema = exports.ResetpasswordSchema = exports.ForgetPasswordSchem = exports.LoginSchema = exports.SignupSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const Role = zod_1.default.enum(["SELLER", "BUYER"]);
exports.SignupSchema = zod_1.default.object({
    fullName: zod_1.default.string().min(1, "name is required"),
    email: zod_1.default.string().email("Invalid Email").min(1, "email is required"),
    password: zod_1.default.string().min(6, "Your Password must be at least 6 characters"),
    role: Role
});
exports.LoginSchema = zod_1.default.object({
    email: zod_1.default.string().email("Invalid Email").min(1, "email is required"),
    password: zod_1.default.string().min(6, "Your Password must be at least 6 characters"),
});
exports.ForgetPasswordSchem = zod_1.default.object({
    email: zod_1.default.string().email("Invalid Email").min(1, "email is required"),
});
exports.ResetpasswordSchema = zod_1.default.object({
    password: zod_1.default.string().min(6, "Your password must be at least 6 characters")
});
exports.UserSchema = zod_1.default.object({
    fullName: zod_1.default.string().min(1, "name")
});
exports.addressSchema = zod_1.default.object({
    lineOne: zod_1.default.string().min(1, "Please enter street "),
    lineTwo: zod_1.default.string(),
    city: zod_1.default.string().min(1, "please enter your city"),
    country: zod_1.default.string().min(1, "please enter your country")
});
