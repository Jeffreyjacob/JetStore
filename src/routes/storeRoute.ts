import {Router} from "express";
import { CheckRole, VerifyToken } from "../middleware/authMiddleware";
import { AsyncErrorHandler } from "../utils/asyncHandler";
import { CreateStoreHandler, EditStoreHandler, GetStoreHandler } from "../controller/storeController";
import { upload } from "../utils/multer";


const storeRoute = Router()


storeRoute.route("/createStore").post(upload.single("image"),VerifyToken,CheckRole,AsyncErrorHandler(CreateStoreHandler))
storeRoute.route("/editStore/:id").put(upload.single("image"),VerifyToken,CheckRole,AsyncErrorHandler(EditStoreHandler))
storeRoute.route("/getStore").get(VerifyToken,CheckRole,AsyncErrorHandler(GetStoreHandler))

export default storeRoute;