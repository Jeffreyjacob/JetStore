import express from "express"
import { VerifyToken } from "../middleware/authMiddleware"
import { AsyncErrorHandler } from "../utils/asyncHandler"
import { BuyerOrderHandler, ChangeOrderStatus, createCheckoutSession, DeleteOrderHandler, GetSellerOrderHandler, stripeWebookHandler } from "../controller/orderController"


const orderRoute = express.Router()

orderRoute.route("/createCheckout").post(VerifyToken,AsyncErrorHandler(createCheckoutSession))
orderRoute.route("/checkout/webhook").post(AsyncErrorHandler(stripeWebookHandler))
orderRoute.route("/sellerOrder").get(VerifyToken,AsyncErrorHandler(GetSellerOrderHandler))
orderRoute.route("/buyerOrder").get(VerifyToken,AsyncErrorHandler(BuyerOrderHandler))
orderRoute.route("/changeOrderStatus/:id").put(VerifyToken,AsyncErrorHandler(ChangeOrderStatus))
orderRoute.route("/deleteOrder/:id").delete(VerifyToken,AsyncErrorHandler(DeleteOrderHandler))

export default orderRoute;