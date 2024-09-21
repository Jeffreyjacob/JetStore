"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewSchema = exports.productSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const Category = zod_1.default.enum(["CLOTHIES", "ACCESSERIES", "SHOES", "BAGS"]);
exports.productSchema = zod_1.default.object({
    name: zod_1.default.string().min(1, "product name is required"),
    description: zod_1.default.string().min(1, "product description is required"),
    price: zod_1.default.string(),
    quantityAvaliable: zod_1.default.string(),
    color: zod_1.default.union([zod_1.default.string(), zod_1.default.array(zod_1.default.string().min(1, "please add a color"))])
        .transform((val) => (typeof val === 'string' ? [val] : val)),
    category: Category,
    storeId: zod_1.default.string(),
    size: zod_1.default.union([zod_1.default.string(), zod_1.default.array(zod_1.default.string().min(1, "please add a size"))])
        .transform((val) => (typeof val === 'string' ? [val] : val)),
});
exports.reviewSchema = zod_1.default.object({
    reviewText: zod_1.default.string().min(1, "leave a review")
});
