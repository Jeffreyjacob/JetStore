import { PrismaClient } from "@prisma/client"
import { Request,Response} from "express"
import { ForgetPasswordSchem, LoginSchema, ResetpasswordSchema, SignupSchema } from "../schema/userSchema"
import AppError from "../utils/AppError";
import bcrypt from "bcryptjs"
import { GenerateToken } from "../utils/generateToken";
import { GenerateCookie } from "../utils/generateCookie";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendMail";


const prismaClient = new PrismaClient()

export const SignUpHandler = async(req:Request,res:Response)=>{
     const request = SignupSchema.parse(req.body)
     const {fullName,email,password,role} = request;

     const existingEmail =  await prismaClient.user.findFirst({where:{email}})
     if(existingEmail){
        throw new AppError("Email already exist",401)
     }
     const hashPassword = await bcrypt.hashSync(password,10);
     const user = await prismaClient.user.create({
        data:{
            fullname:fullName,
            email,
            password:hashPassword,
            role:role
        },
        include:{
         address:true,
         store:true,
         cart:{include:{product:true}}
      }
     })

    const token = GenerateToken(user)
    GenerateCookie(token,res)
    return res.status(201).json({
      ...user,
      password:undefined
    })
}

export const LoginHandler = async (req:Request,res:Response)=>{
     
   const request = LoginSchema.parse(req.body)
   const {email,password} = request

   const user = await prismaClient.user.findFirst({
      where:{email},
      include:{
         address:true,
         store:true,
         cart:{include:{product:true}}
      }
   })

   if(!user){
      throw new AppError("invalid credentails",401)
   }

   const matchPassword = await bcrypt.compareSync(password,user.password)

   if(!matchPassword){
      throw new AppError("invalid credentials",401)
   }

   const token = GenerateToken(user)
   GenerateCookie(token,res)
   return res.status(200).json({
      ...user,
      password:undefined
   })
      
}

export const ForgetPasswordHandler = async(req:Request,res:Response)=>{
      const request = ForgetPasswordSchem.parse(req.body)
      const {email} = request

      const findUser = await prismaClient.user.findFirst({
         where:{email}
      })

      if(!findUser){
         throw new AppError("User does not exist",401)
      }
       const resetToken = jwt.sign({id:findUser.id},process.env.JWT_SECRET!,{
          expiresIn:"15m"
       })

      const user = await prismaClient.user.update({
         where:{
            id:findUser.id
         },
         data:{
           resetToken
         }
      })
      
      const resetUrl = `${process.env.FRONTENDURL}/resetpassword/${resetToken}`

      const message = ` <h1>You have a required a password reset</h1>
                            <p>Please go to this link to reset your password</p>
                            <a href=${resetUrl} clicktracking=off>${resetUrl}</a>`

      try{
        await sendEmail({
         to:findUser.email,
         subject:"Password Reset Request",
         text:message
        })
        return res.json({message:"Email Reset link has been sent"})
      }catch(error){
         console.log(error)
         await prismaClient.user.update({
            where:{id:findUser.id},
            data:{resetToken:undefined}
         })
         return {message:"Email was not sent"}
      }
}

export const ResetPasswordHandler = async (req:Request,res:Response)=>{
        const request = ResetpasswordSchema.parse(req.body)
        const {password} = request;
        const {resetToken} = req.params

        const checkTokenValidity:{id:number} = await jwt.verify(resetToken,process.env.JWT_SECRET!) as any
         const hashPassword = await bcrypt.hashSync(password,10)
         const user = await prismaClient.user.update({
            where:{id:checkTokenValidity.id},
            data:{
               resetToken:null,
               password:hashPassword
            }
         })

         if(!user){
            throw new AppError("user not found",404)
         } 
       res.status(200).json({
         message:"Password Reset Successfully!"
       })
}


export const LogOutHandler = async (req:Request,res:Response)=>{
   res.cookie("token","",{maxAge:0})
   res.status(200).json({
    success:true,
    message:"Logout Successfully!"
   })
 }
