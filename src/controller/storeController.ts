import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import {v2 as cloudinary} from "cloudinary"
import { StoreSchema } from "../schema/storeSchema";

const prismaClient = new PrismaClient()

export const CreateStoreHandler = async(req:Request,res:Response)=>{
    const userId = req.user.id
     const request  = StoreSchema.parse(req.body)
     const {storeName,storeDescription} = request;
     const imageUrl = await uploadImage(req.file as Express.Multer.File)

     const store = await prismaClient.store.create({
        data:{
            storeName,
            storeDescription,
            storeImage:imageUrl,
            storeOwnerId:userId
        }
     })

     return res.status(201).json(store)
     
}


export const GetStoreHandler = async (req:Request,res:Response)=>{
    const userId = req.user.id

    const store = await prismaClient.store.findFirst({
        where:{storeOwnerId:userId},
        include:{
            product:true
        }
    })

    return res.status(200).json({store})
}

export const EditStoreHandler = async(req:Request,res:Response)=>{
     const request = StoreSchema.parse(req.body)
     const {storeName,storeDescription} = request
     const id = req.params.id

     const imageUrl = await uploadImage(req.file as Express.Multer.File)

     const store = await prismaClient.store.update({
         where:{
            id:+id
         },
         data:{
            storeName,
            storeDescription,
            storeImage:imageUrl,
         }
     })

     return res.status(200).json({store})
}




const uploadImage = async (File:Express.Multer.File)=>{
    
    const base64Image = Buffer.from(File.buffer).toString("base64")
    const dataURI = `data:${File.mimetype};base64,${base64Image}`
    const uploadResponse = await cloudinary.uploader.upload(dataURI)
    return uploadResponse.url
}

