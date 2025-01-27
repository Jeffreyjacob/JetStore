import { NextFunction, Request, Response } from "express";
import AppError from "../utils/AppError";
import jwt from "jsonwebtoken";
import { PrismaClient, User } from "@prisma/client";

declare global {
    namespace Express {
        interface Request {
            user:User
        }
    }
}

const prismaClient = new PrismaClient()

export const VerifyToken = async (req:Request,res:Response,next:NextFunction)=>{
     try{
        const authHeader = req.headers['authorization'];
      console.log(authHeader)
        if(!authHeader){
          throw new AppError("token is required",401)
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            throw new AppError("Token is malformed", 401);
        }
        const decoded:{id:number} =  await jwt.verify(token,process.env.JWT_SECRET!) as any
        
        const user = await prismaClient.user.findFirst({
           where:{id:decoded.id}
        })

        if (!user) {
            throw new AppError("user not found", 404)
        }
        req.user = user;
        next()
     }catch(error){
        console.log(error)
        next(error)
     }
}

export const CheckRole = async (req:Request,res:Response,next:NextFunction)=>{
    try{
      const user = req.user
      if(user.role === "SELLER"){
         next()
      }else{
         throw new AppError("User is not an admin and not authorized",401)
    }
    }catch(error){
       console.log(error)
       next(error)
    }
}