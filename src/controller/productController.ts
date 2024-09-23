import { Request, Response } from "express";
import { productSchema, reviewSchema } from "../schema/productSchema";
import {v2 as cloudinary} from "cloudinary"
import { Prisma, PrismaClient } from "@prisma/client";


const prismaClient = new PrismaClient()

export const CreateProductHandler = async(req:Request,res:Response)=>{
        const request = productSchema.parse(req.body)
        const {name,description,category,price,quantityAvaliable,color,storeId,size} = request
        const imagesUrl = await uploadImages(req.files as Express.Multer.File[])
        const userId =  req.user.id

        const product = await prismaClient.product.create({
            data:{
                name,
                description,
                category,
                price:parseInt(price),
                quantityAvaliable:parseInt(quantityAvaliable),
                color,
                images:imagesUrl,
                userId,
                size,
                storeId:+storeId
            }
        })

        return res.status(201).json({product})
}

export const GetProductByUserId = async(req:Request,res:Response)=>{
     const userId = req.user.id
      const page = parseInt(req.query.page as string) || 1
      const querySearch = req.query.search as string || ""
      const pageSize = parseInt(req.query.pageSize as string) || 10
      let query = "" 
      const totalProduct = await prismaClient.product.count({
         where:{userId}
      })
      const totalPage = Math.ceil(totalProduct/pageSize)

      if (querySearch) {
          query = querySearch
       }
     const product = await prismaClient.product.findMany({
        where:{
            AND:[
                {userId:userId},
                {name:{contains:query,
                mode:"insensitive"}}
            ]
        },
        skip:(page - 1) * pageSize,
        take:pageSize
     })

     return res.status(200).json({
        product,
        totalProduct,
        totalPage,
        currentpage:page
     })
}

export const GetProductById = async(req:Request,res:Response)=>{
      const productId = req.params.id
      const product = await prismaClient.product.findFirstOrThrow({
         where:{id:+productId},
         include:{
            reviews:{include:{user:true}}
         }
      })
      return res.status(200).json({product})
}

export const GetAllProduct = async (req:Request,res:Response)=>{
     
    const product = await prismaClient.product.findMany()
    return res.status(200).json({product})
    
}

export const EditProductHandler = async (req:Request,res:Response)=>{
        const request = productSchema.parse(req.body)
        const {name,description,category,price,quantityAvaliable,color,storeId,size} = request
        const imagesUrl = await uploadImages(req.files as Express.Multer.File[])
        const userId =  req.user.id
        const productId = req.params.id

        const product = await prismaClient.product.update({
            where:{id:+productId},
            data:{
                name,
                description,
                category,
                price:parseInt(price),
                quantityAvaliable:parseInt(quantityAvaliable),
                color,
                images:imagesUrl,
                userId,
                size,
                storeId:+storeId
            }
        })

        return res.status(200).json({product})
}

export const  DeleteProductHandler = async (req:Request,res:Response)=>{
       const productId = req.params.id

       const product = await prismaClient.product.delete({
          where:{id:+productId}
       })

       return res.status(200).json({message:"Product deleted"})
}

export const AddReviewHandler = async (req:Request,res:Response)=>{
     const userId = req.user.id
     const productId = req.params.id
     const request = reviewSchema.parse(req.body)
     const review = await prismaClient.review.create({
        data:{
           reviewText:request.reviewText,
           userId,
           productId:+productId
        },
        include:{
            user:true
        }
     })

     return res.status(201).json({review})
}

export const deleteReviewHandler = async (req:Request,res:Response)=>{
     const productId = req.params.id
     const reviews = await prismaClient.review.delete({
         where:{
            id:+productId
         }
     })

     return res.status(200).json({reviews})
}

export const GetProductReview = async(req:Request,res:Response)=>{
    const productId = req.params.id
    const sortBy = req.params.sortBy as Prisma.SortOrder  || "asc"

    const review = await prismaClient.review.findMany({
        where:{
            productId:+productId,
        },
        include:{
          user:true
        },
        orderBy:{
            createdAt:sortBy
        }
    })

    return res.status(200).json({review})
}

export const RelatedProductHandler = async (req:Request,res:Response)=>{
        const productId = req.params.id
       return await prismaClient.$transaction(async(tx)=>{
           const product = await tx.product.findFirst({
              where:{id:+productId}
           })

           const productByCategory = await tx.product.findMany({
              where:{category:product?.category}
           })

           const relatedProducts = productByCategory.filter(p => p.id !== +productId);

           return res.status(200).json({productByCategory:relatedProducts})
       })
}

export const SearchProductHandler = async (req:Request,res:Response)=>{
      
       const searchTerm = req.query.search as string || "" 
       const page = parseInt(req.query.page as string) || 1
       const pagesize = parseInt(req.query.pagesize as string) || 9
       let query = ""
       const totalProduct = await prismaClient.product.count()
       const totalPage = Math.ceil(totalProduct/pagesize)
       if(searchTerm){
          query = searchTerm
       }
       const searchProduct = await prismaClient.product.findMany({
          where:{name:{
            contains:query,
            mode:"insensitive"
          }},
          skip:(page - 1) * pagesize,
          take:pagesize
       })

       return res.status(200).json({
          product:searchProduct,
          currentPage:page,
          totalProduct,
          totalPage
       })
}

const uploadImages = async (Files:Express.Multer.File[]):Promise<string[]> =>{
    const uploadPromise = Files.map(async(file)=>{
        const base64Image = Buffer.from(file.buffer).toString("base64")
        const dataURI = `data:${file.mimetype};base64,${base64Image}`
        const uploadedResponse = await cloudinary.uploader.upload(dataURI)
        return uploadedResponse.url
    })

    const imagesUrl = await Promise.all(uploadPromise)
    return imagesUrl
}