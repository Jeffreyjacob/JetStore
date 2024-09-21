import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import ErrorHandler from "./middleware/ErrorHandler";
import authRoute from "./routes/authRoute";
import userRoute from "./routes/userRoute";
import storeRoute from "./routes/storeRoute";
import {v2 as cloudinary} from "cloudinary"
import productRoute from "./routes/productRoute";
import cartRoute from "./routes/cartRoute";
import orderRoute from "./routes/orderRoute";

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const app = express()
app.use(cors({
    origin:["http://localhost:3000"],
    credentials:true
}))
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({policy:"cross-origin"}));
app.use(morgan("common"));
app.use(cookieParser())
app.use("/api/order/checkout/webhook",express.raw({type:"*/*"}));
app.use(express.json())


app.use("/api/auth",authRoute)
app.use("/api/user",userRoute)
app.use("/api/store",storeRoute)
app.use("/api/product",productRoute)
app.use("/api/cart",cartRoute)
app.use("/api/order",orderRoute)

app.use(ErrorHandler)

const PORT = process.env.PORT || 8000

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
})
