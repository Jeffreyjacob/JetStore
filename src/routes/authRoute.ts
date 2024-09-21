import {Router} from "express";
import { ForgetPasswordHandler, LoginHandler, LogOutHandler, ResetPasswordHandler, SignUpHandler } from "../controller/authController";
import { AsyncErrorHandler } from "../utils/asyncHandler";


const authRoute = Router()

authRoute.route("/signup").post(AsyncErrorHandler(SignUpHandler))
authRoute.route("/login").post(AsyncErrorHandler(LoginHandler))
authRoute.route("/forgetPassword").post(AsyncErrorHandler(ForgetPasswordHandler))
authRoute.route("/resetPassword/:resetToken").post(AsyncErrorHandler(ResetPasswordHandler))
authRoute.route("/logout").post(AsyncErrorHandler(LogOutHandler))

export default authRoute;


