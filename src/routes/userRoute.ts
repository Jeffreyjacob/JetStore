import {Router} from "express";
import { VerifyToken } from "../middleware/authMiddleware";
import { AsyncErrorHandler } from "../utils/asyncHandler";
import { AddAddressHandler, AuthUserHandler, RemoveAddressHandler, UpdateUserProfile } from "../controller/userController";
import { upload } from "../utils/multer";


const userRoute = Router()

userRoute.route("/authUser").get(VerifyToken,AsyncErrorHandler(AuthUserHandler))
userRoute.route("/updateUserProfile").put(upload.single("image"),VerifyToken,AsyncErrorHandler(UpdateUserProfile))
userRoute.route("/addAddress").post(VerifyToken,AsyncErrorHandler(AddAddressHandler))
userRoute.route("/removeAddress/:id").delete(VerifyToken,AsyncErrorHandler(RemoveAddressHandler))

export default userRoute