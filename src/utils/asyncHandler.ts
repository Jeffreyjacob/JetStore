import { NextFunction, Request, Response } from "express"


export const AsyncErrorHandler = (method:Function)=>{
  return async (req:Request,res:Response,next:NextFunction)=>{
       try{
         await method(req,res,next)
       }catch(error){
        console.log(error)
        next(error)
       }
  }
}