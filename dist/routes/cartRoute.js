"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const asyncHandler_1 = require("../utils/asyncHandler");
const cartController_1 = require("../controller/cartController");
const cartRoute = express_1.default.Router();
cartRoute.route("/addCart").post(authMiddleware_1.VerifyToken, (0, asyncHandler_1.AsyncErrorHandler)(cartController_1.AddCartHandler));
cartRoute.route("/changeQuantity/:id").put(authMiddleware_1.VerifyToken, (0, asyncHandler_1.AsyncErrorHandler)(cartController_1.ChangeQuantity));
cartRoute.route("/deleteCart/:id").delete(authMiddleware_1.VerifyToken, (0, asyncHandler_1.AsyncErrorHandler)(cartController_1.RemoveCartHandler));
exports.default = cartRoute;
