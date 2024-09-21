import express from "express"
import { VerifyToken } from "../middleware/authMiddleware"
import { AsyncErrorHandler } from "../utils/asyncHandler"
import { createCheckoutSession, stripeWebookHandler } from "../controller/orderController"


const orderRoute = express.Router()

orderRoute.route("/createCheckout").post(VerifyToken,AsyncErrorHandler(createCheckoutSession))
orderRoute.route("/checkout/webhook").post(AsyncErrorHandler(stripeWebookHandler))


export default orderRoute;