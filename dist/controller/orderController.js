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
exports.ChangeOrderStatus = exports.BuyerOrderHandler = exports.GetSellerOrderHandler = exports.createCheckoutSession = exports.stripeWebookHandler = void 0;
const stripe_1 = __importDefault(require("stripe"));
const OrderSchema_1 = require("../schema/OrderSchema");
const client_1 = require("@prisma/client");
const AppError_1 = __importDefault(require("../utils/AppError"));
const STRIPE = new stripe_1.default(process.env.STRIPE_API_KEY);
const FRONTEND_URL = process.env.FRONTENDURL;
const STRIPE_ENDPOINT_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const prismaClient = new client_1.PrismaClient();
const stripeWebookHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
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
        const session = event.data.object;
        const productDetail = JSON.parse((_a = session.metadata) === null || _a === void 0 ? void 0 : _a.productDetails);
        try {
            // Iterate through the productDetails array and update each product's quantity
            for (const { productId, quantity } of productDetail) {
                // Find the product and reduce its quantity
                const product = yield prismaClient.product.findUnique({
                    where: {
                        id: productId
                    }
                });
                if (product) {
                    yield prismaClient.product.update({
                        where: {
                            id: productId
                        },
                        data: {
                            quantityAvaliable: product.quantityAvaliable - quantity
                        }
                    });
                }
            }
            // Update the order status to PAID
            yield prismaClient.orders.update({
                where: {
                    id: +((_b = event.data.object.metadata) === null || _b === void 0 ? void 0 : _b.orderId)
                },
                data: {
                    status: client_1.OrderStatus.PAID
                }
            });
            res.status(200).json();
        }
        catch (error) {
            console.log(error);
            res.status(500).json(`Error updating product quantities: ${error.message}`);
        }
    }
    if (event.type === "checkout.session.expired") {
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
    if (event.type === "payment_intent.canceled") {
        const order = yield prismaClient.orders.update({
            where: {
                id: +((_d = event.data.object.metadata) === null || _d === void 0 ? void 0 : _d.orderId)
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
        const session = yield createSession(lineTerm, order.id.toString(), cart, userId.toString());
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
const createSession = (lineItem, orderId, cart, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const productDetails = cart.map((cart) => ({
        productId: cart.productId,
        quantity: cart.quantity
    }));
    const sessionData = yield STRIPE.checkout.sessions.create({
        line_items: lineItem,
        mode: "payment",
        metadata: {
            orderId,
            productDetails: JSON.stringify(productDetails)
        },
        success_url: `${FRONTEND_URL}/afterpayment?success=true`,
        cancel_url: `${FRONTEND_URL}/cart?cancelled=true`
    });
    return sessionData;
});
const GetSellerOrderHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const totalOrder = yield prismaClient.orderProduct.count({
        where: { ProductOwner: userId }
    });
    const totalPages = Math.ceil(totalOrder / pageSize);
    const order = yield prismaClient.orderProduct.findMany({
        where: { ProductOwner: userId },
        include: {
            Order: { include: { buyer: true } },
            product: true
        },
        skip: (page - 1) * pageSize,
        take: pageSize
    });
    return res.status(200).json({
        order,
        currentPage: page,
        totalPages,
        totalOrder
    });
});
exports.GetSellerOrderHandler = GetSellerOrderHandler;
const BuyerOrderHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    const order = yield prismaClient.orders.findMany({
        where: { buyerId: userId },
        include: {
            Product: {
                include: {
                    product: { include: { store: true } }
                }
            }
        }
    });
    return res.status(200).json({ order });
});
exports.BuyerOrderHandler = BuyerOrderHandler;
const ChangeOrderStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const orderId = req.params.id;
    const request = OrderSchema_1.changeOrderStatusSchema.parse(req.body);
    const { status } = request;
    const order = yield prismaClient.orders.update({
        where: { id: +orderId },
        data: {
            status: status
        }
    });
    return res.status(200).json({ message: "Order status updated!" });
});
exports.ChangeOrderStatus = ChangeOrderStatus;
