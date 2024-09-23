"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeOrderStatusSchema = exports.OrderSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const Status = zod_1.default.enum(["SHIPPED", "DELIEVERED", "CANCELED", "PAID", "PLACED"]);
exports.OrderSchema = zod_1.default.object({
    address: zod_1.default.string()
});
exports.changeOrderStatusSchema = zod_1.default.object({
    status: Status
});
