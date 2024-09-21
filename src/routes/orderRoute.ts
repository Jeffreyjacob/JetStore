import express from "express"
import { VerifyToken } from "../middleware/authMiddleware"
import { AsyncErrorHandler } from "../utils/asyncHandler"
import { createCheckoutSession } from "../controller/orderController"


const orderRoute = express.Router()

orderRoute.route("/createCheckout").post(VerifyToken,AsyncErrorHandler(createCheckoutSession))



export default orderRoute;