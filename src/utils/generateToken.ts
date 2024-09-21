import { User } from "@prisma/client";
import jwt from "jsonwebtoken";

export const GenerateToken = (user:User)=>{
   return jwt.sign({id:user.id},process.env.JWT_SECRET!,{
     expiresIn:"7d"
   })
}