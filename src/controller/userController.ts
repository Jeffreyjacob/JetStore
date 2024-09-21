import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { addressSchema, UserSchema } from "../schema/userSchema";
import {v2 as cloudinary} from "cloudinary"

const prismaClient = new PrismaClient()

export const AuthUserHandler = async (req:Request,res:Response)=>{
      const userId = req.user.id

      const user = await prismaClient.user.findFirst({
        where:{id:userId},
        include:{
            address:true,
            store:true,
            cart:{include:{product:true}}
        }
      })
     
    return res.status(200).json({
        ...user,
        password:undefined
    })    
}

export const UpdateUserProfile = async (req:Request,res:Response)=>{
     console.log(req.file)
     const userId = req.user.id

     const request = UserSchema.parse(req.body)
     const profileImageUrl = await uploadImage(req.file as Express.Multer.File)

     const user = await prismaClient.user.update({
        where:{id:userId},
        data:{
          fullname:request.fullName,
          profilePicture:profileImageUrl
        },
        include:{
          address:true,
          store:true,
        }
     })

     return res.status(200).json({...user,password:undefined})
}

export const AddAddressHandler = async (req:Request,res:Response)=>{
    const userId = req.user.id
    const request = addressSchema.parse(req.body)
     const {lineOne,lineTwo,city,country} = request

     const address = await prismaClient.address.create({
        data:{
           lineOne,
           lineTwo,
           city,
           country,
           userId
        }
     })

     return res.status(201).json({address})
}

export const RemoveAddressHandler = async (req:Request,res:Response)=>{
    const userId = req.user.id
    const addressId = req.params.id

    const address = await prismaClient.address.delete({
       where:{id:+addressId}
    })

    return res.status(200).json({address})
}


const uploadImage = async (file:Express.Multer.File)=>{
     const base64Image = Buffer.from(file.buffer).toString("base64")
    const dataURI = `data:${file.mimetype};base64,${base64Image}`
     const uploadedImage = await cloudinary.uploader.upload(dataURI)
     return uploadedImage.url
}