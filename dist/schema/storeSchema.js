"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.StoreSchema = zod_1.default.object({
    storeName: zod_1.default.string().min(1, "store name is required"),
    storeDescription: zod_1.default.string().min(1, "store discription is required")
});
