import {Router} from "express"
import { VerifyToken } from "../middleware/authMiddleware"
import { AsyncErrorHandler } from "../utils/asyncHandler"
import { AddWishlistHandler } from "../controller/wishlistController"


const wishlistRouter = Router()

wishlistRouter.route("/addWishlit").post(VerifyToken,AsyncErrorHandler(AddWishlistHandler))


export default wishlistRouter;