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
exports.createCheckoutSession = exports.stripeWebookHandler = void 0;
const stripe_1 = __importDefault(require("stripe"));
const OrderSchema_1 = require("../schema/OrderSchema");
const client_1 = require("@prisma/client");
const AppError_1 = __importDefault(require("../utils/AppError"));
const STRIPE = new stripe_1.default(process.env.STRIPE_API_KEY);
const FRONTEND_URL = process.env.FRONTENDURL;
const STRIPE_ENDPOINT_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const prismaClient = new client_1.PrismaClient();
const stripeWebookHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    let event;
    try {
        const sig = req.headers["stripe-signature"];
        event = STRIPE.webhooks.constructEvent(req.body, sig, STRIPE_ENDPOINT_SECRET);
    }
    catch (error) {
        console.log(error);
        return res.status(400).json(`webhook error : ${error.message}`);
    }
    if (event.type === "checkout.session.completed") {
        const order = yield prismaClient.orders.update({
            where: {
                id: +((_a = event.data.object.metadata) === null || _a === void 0 ? void 0 : _a.orderId)
            },
            data: {
                status: client_1.OrderStatus.PAID
            }
        });
        res.status(200).json();
    }
    if (event.type === "checkout.session.expired") {
        const order = yield prismaClient.orders.update({
            where: {
                id: +((_b = event.data.object.metadata) === null || _b === void 0 ? void 0 : _b.orderId)
            },
            data: {
                status: client_1.OrderStatus.CANCELED
            }
        });
        res.status(200).json();
    }
    if (event.type === "payment_intent.canceled") {
        const order = yield prismaClient.orders.update({
            where: {
                id: +((_c = event.data.object.metadata) === null || _c === void 0 ? void 0 : _c.orderId)
            },
            data: {
                status: client_1.OrderStatus.CANCELED
            }
        });
        res.status(200).json();
    }
});
exports.stripeWebookHandler = stripeWebookHandler;
const createCheckoutSession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    const request = OrderSchema_1.OrderSchema.parse(req.body);
    const { address } = request;
    return yield prismaClient.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const cart = yield tx.cartItem.findMany({
            where: { userId },
            include: {
                product: true
            }
        });
        if (cart.length === 0) {
            throw new AppError_1.default("Cart is Empty", 400);
        }
        const price = cart.reduce((prev, cart) => prev + parseInt(cart.product.price.toString()) * cart.quantity, 0);
        const order = yield tx.orders.create({
            data: {
                buyerId: userId,
                address,
                netAmount: price,
                Product: {
                    create: cart.map((cart) => {
                        return {
                            productId: cart.productId,
                            quantity: cart.quantity,
                            ProductOwner: cart.product.userId
                        };
                    })
                }
            }
        });
        console.log(order);
        const orderEvent = yield tx.orderEventStatus.create({
            data: {
                orderId: order.id,
            }
        });
        const lineTerm = createLineItems(cart);
        const session = yield createSession(lineTerm, order.id.toString(), userId.toString());
        if (!session.url) {
            throw new AppError_1.default("Error creating order", 500);
        }
        return res.status(200).json({ url: session.url });
    }));
});
exports.createCheckoutSession = createCheckoutSession;
const createLineItems = (CartItem) => {
    const lineTerm = CartItem.map((cart) => {
        const line_item = {
            price_data: {
                currency: "usd",
                unit_amount: Math.round(cart.product.price * 100),
                product_data: {
                    name: cart.product.name,
                    images: [cart.product.images[0]]
                }
            },
            quantity: cart.quantity
        };
        return line_item;
    });
    return lineTerm;
};
const createSession = (lineItem, orderId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const sessionData = yield STRIPE.checkout.sessions.create({
        line_items: lineItem,
        mode: "payment",
        metadata: {
            orderId
        },
        success_url: `${FRONTEND_URL}/afterpayment?success=true`,
        cancel_url: `${FRONTEND_URL}/cart?cancelled=true`
    });
    return sessionData;
});
