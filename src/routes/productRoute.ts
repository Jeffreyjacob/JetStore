import {Router} from "express"
import { CheckRole, VerifyToken } from "../middleware/authMiddleware"
import { upload } from "../utils/multer"
import { AsyncErrorHandler } from "../utils/asyncHandler"
import { AddReviewHandler, CreateProductHandler, DeleteProductHandler,
     deleteReviewHandler, EditProductHandler, GetAllProduct, GetProductById, 
     GetProductByUserId, GetProductReview, 
     RelatedProductHandler} from "../controller/productController"

const productRoute = Router()


productRoute.route("/createProduct").post(upload.array("images"),
VerifyToken,CheckRole,AsyncErrorHandler(CreateProductHandler))
productRoute.route("/getAllProduct").get(AsyncErrorHandler(GetAllProduct))
productRoute.route("/getProductbyUserId").get(VerifyToken,CheckRole,AsyncErrorHandler(GetProductByUserId))
productRoute.route("/editProduct/:id").put(upload.array("images"),
VerifyToken,CheckRole,AsyncErrorHandler(EditProductHandler))
productRoute.route("/getProductbyId/:id").get(AsyncErrorHandler(GetProductById))
productRoute.route("/deleteProduct/:id").delete(VerifyToken,CheckRole,AsyncErrorHandler(DeleteProductHandler))
productRoute.route("/addReview/:id").post(VerifyToken,AsyncErrorHandler(AddReviewHandler))
productRoute.route("/removeReview/:id").delete(VerifyToken,AsyncErrorHandler(deleteReviewHandler))
productRoute.route("/getProductReview/:id").get(AsyncErrorHandler(GetProductReview))
productRoute.route("/relatedProduct/:id").get(AsyncErrorHandler(RelatedProductHandler))



export default productRoute