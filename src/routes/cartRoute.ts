import express from "express"
import { VerifyToken } from "../middleware/authMiddleware"
import { AsyncErrorHandler } from "../utils/asyncHandler"
import { AddCartHandler, ChangeQuantity, RemoveCartHandler } from "../controller/cartController"


const cartRoute = express.Router()

cartRoute.route("/addCart").post(VerifyToken,AsyncErrorHandler(AddCartHandler))
cartRoute.route("/changeQuantity/:id").put(VerifyToken,AsyncErrorHandler(ChangeQuantity))
cartRoute.route("/deleteCart/:id").delete(VerifyToken,AsyncErrorHandler(RemoveCartHandler))

export default cartRoute