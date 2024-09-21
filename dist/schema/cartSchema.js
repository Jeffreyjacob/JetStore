"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeQuantitySchema = exports.CartSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.CartSchema = zod_1.default.object({
    productId: zod_1.default.number(),
    quantity: zod_1.default.number(),
    selectedSize: zod_1.default.string().min(1, "Please select a size"),
    selectedColor: zod_1.default.string().min(1, "Please select a color")
});
exports.ChangeQuantitySchema = zod_1.default.object({
    quantity: zod_1.default.number().min(1, "Please enter a quantity")
});
