import { NextFunction, Request, Response } from "express";
import AppError from "../utils/AppError";
import { ZodError } from "zod";
import {TokenExpiredError} from "jsonwebtoken";
import { Prisma } from "@prisma/client";


const handleAppError = (err:AppError,res:Response)=>{
    return res.status(err.statusCode).json({
        status:"fail",
        message:err.message
    })
}

const handleZodError = (err:ZodError,res:Response)=>{
    console.log("zodError",err)
    return res.status(400).json({
        status:"fail",
        message:"Validation Error",
        error:err.issues.map((error)=>({
            path:error.path.join(","),
            error:error.message
        }))
    })
}

const handleTokenExpired = (err:TokenExpiredError,res:Response)=>{
   return res.status(401).json({
    status:"fail",
    message:err.message
   })
}

const handlePrismaError = (err:Prisma.PrismaClientKnownRequestError,res:Response)=>{
   return res.status(404).json({
    status:"fail",
    message:err.meta || err.message
   })
}

const ErrorHandler = (err:any,req:Request,res:Response,next:NextFunction)=>{
      if(err instanceof ZodError){
        return handleZodError(err,res)
      }
      if(err instanceof AppError){
        return handleAppError(err,res)
      }
      if(err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025"){
        return handlePrismaError(err,res)
      } 
      if(err instanceof TokenExpiredError){
        return handleTokenExpired(err,res)
      }
      return res.status(500).json({
         status:"fail",
         message:"Something went wrong"
      })
}

export default ErrorHandler;