import { Response } from "express";


export const GenerateCookie = (token:string,res:Response)=>{
   return res.cookie("token",token,{
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly:true,
    sameSite:"strict",
   })
}