import {Router} from "express"
import { VerifyToken } from "../middleware/authMiddleware"
import { AsyncErrorHandler } from "../utils/asyncHandler"
import { AddWishlistHandler, RemoveWishlist } from "../controller/wishlistController"


const wishlistRouter = Router()

wishlistRouter.route("/addWishlit").post(VerifyToken,AsyncErrorHandler(AddWishlistHandler))
wishlistRouter.route("/removeWishlist/:id").delete(VerifyToken,AsyncErrorHandler(RemoveWishlist))

export default wishlistRouter;