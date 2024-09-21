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
exports.RemoveCartHandler = exports.ChangeQuantity = exports.AddCartHandler = void 0;
const client_1 = require("@prisma/client");
const cartSchema_1 = require("../schema/cartSchema");
const AppError_1 = __importDefault(require("../utils/AppError"));
const prismaClient = new client_1.PrismaClient();
const AddCartHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    const request = cartSchema_1.CartSchema.parse(req.body);
    const { productId, quantity, selectedColor, selectedSize } = request;
    const existingCart = yield prismaClient.cartItem.findFirst({
        where: {
            AND: [
                { productId: productId },
                { userId: userId }
            ]
        },
        include: {
            product: true
        }
    });
    if (existingCart) {
        if ((quantity + existingCart.quantity) > existingCart.product.quantityAvaliable) {
            throw new AppError_1.default("You exceeded the amount of stock we have for this product", 400);
        }
        const cart = yield prismaClient.cartItem.update({
            where: { id: existingCart.id },
            data: {
                quantity: existingCart.quantity + quantity
            },
            include: {
                product: true
            }
        });
        return res.status(200).json({ cart });
    }
    else {
        const cart = yield prismaClient.cartItem.create({
            data: {
                productId: productId,
                quantity: quantity,
                userId,
                selectedColor,
                selectedSize
            },
            include: {
                product: true
            }
        });
        return res.status(201).json({ cart });
    }
});
exports.AddCartHandler = AddCartHandler;
const ChangeQuantity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const cardId = req.params.id;
    const request = cartSchema_1.ChangeQuantitySchema.parse(req.body);
    return yield prismaClient.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const cart = yield tx.cartItem.findFirstOrThrow({
            where: { id: +cardId }
        });
        const updatedCart = yield tx.cartItem.update({
            where: { id: cart.id },
            data: {
                quantity: request.quantity
            }
        });
        return res.status(200).json({ Cart: updatedCart });
    }));
});
exports.ChangeQuantity = ChangeQuantity;
const RemoveCartHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const cartId = req.params.id;
    const deletedCart = yield prismaClient.cartItem.delete({
        where: { id: +cartId }
    });
    return res.status(200).json({ cart: deletedCart });
});
exports.RemoveCartHandler = RemoveCartHandler;
