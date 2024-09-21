import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { CartSchema, ChangeQuantitySchema } from "../schema/cartSchema";
import AppError from "../utils/AppError";


const prismaClient = new PrismaClient()

export const AddCartHandler = async (req:Request,res:Response)=>{
      const userId = req.user.id
      const request  = CartSchema.parse(req.body)
      const {productId,quantity,selectedColor,selectedSize} = request 

      const existingCart = await prismaClient.cartItem.findFirst({
          where:{
            AND:[
                {productId:productId},
                {userId:userId}
            ]
          },
          include:{
            product:true
          }
      })

      if(existingCart){
         if((quantity + existingCart.quantity) > existingCart.product.quantityAvaliable){
            throw new AppError("You exceeded the amount of stock we have for this product",400)
         }
        const cart = await prismaClient.cartItem.update({
            where:{id:existingCart.id},
            data:{
                quantity:existingCart.quantity + quantity
            },
            include:{
                product:true
            }
        })
        return res.status(200).json({cart})
      }else{
         const cart = await prismaClient.cartItem.create({
            data:{
                productId:productId,
                quantity:quantity,
                userId,
                selectedColor,
                selectedSize
            },
            include:{
                product:true
            }
         })

         return res.status(201).json({cart})
      }
}

export const ChangeQuantity = async (req:Request,res:Response)=>{
     
    const cardId = req.params.id
    const request = ChangeQuantitySchema.parse(req.body)
    return await prismaClient.$transaction(async(tx)=>{
        const cart = await tx.cartItem.findFirstOrThrow({
            where:{id:+cardId}
        })

        const updatedCart = await tx.cartItem.update({
            where:{id:cart.id},
            data:{
                quantity:request.quantity
            }
        })

        return res.status(200).json({Cart:updatedCart})
    })
}


export const RemoveCartHandler = async (req:Request,res:Response)=>{
     const cartId = req.params.id

     const deletedCart = await prismaClient.cartItem.delete({
         where:{id:+cartId}
     })

     return res.status(200).json({cart:deletedCart})
}
