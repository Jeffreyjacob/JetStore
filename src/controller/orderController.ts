import { Request, Response } from "express";
import Stripe from "stripe";
import { OrderSchema } from "../schema/OrderSchema";
import { CartItem, PrismaClient } from "@prisma/client";
import AppError from "../utils/AppError";


type cartType = {
    createdAt: string
    id: number
    product: {
        id: number
        name: string
        description: string
        category: string
        color: string[]
        images: string[]
        price: number
        quantityAvaliable: number
        size: string[]
        storeId: number
        userId: number
    }
    productId: number
    quantity: number
    selectedColor: string
    selectedSize: string
    userId: number
}

const STRIPE = new Stripe(process.env.STRIPE_API_KEY!)

const FRONTEND_URL = process.env.FRONTENDURL as string;

const prismaClient = new PrismaClient()

export const createCheckoutSession = async (req: Request, res: Response) => {
    const userId = req.user.id
    const request = OrderSchema.parse(req.body)
    const { address } = request

    return await prismaClient.$transaction(async (tx) => {

        const cart = await tx.cartItem.findMany({
            where: { userId },
            include: {
                product: true
            }
        })

        if (cart.length === 0) {
            throw new AppError("Cart is Empty", 400)
        }

        const price = cart.reduce((prev, cart) => prev + parseInt(cart.product.price.toString()) * cart.quantity, 0)

        const order = await tx.orders.create({
            data: {
                buyerId: userId,
                address,
                netAmount: price,
                Product: {
                    create: cart.map((cart) => {
                        return {
                            productId: cart.productId,
                            quantity: cart.quantity,
                            ProductOwner:cart.product.userId
                        }
                    })
                }
            }
        })
         console.log(order)
         const orderEvent = await tx.orderEventStatus.create({
            data:{
               orderId:order.id,
            }
       })
        const lineTerm = createLineItems(cart)
        const session = await createSession(lineTerm,order.id.toString(),userId.toString())
         if(!session.url){
            throw new AppError("Error creating order",500)
         }
         return res.status(200).json({url:session.url})
    })
}


const createLineItems = (CartItem:any[]) => {
    const lineTerm = CartItem.map((cart) => {
        const line_item: Stripe.Checkout.SessionCreateParams.LineItem = {
            price_data: {
                currency: "usd",
                unit_amount:Math.round(cart.product.price* 100),
                product_data:{
                    name:cart.product.name,
                    images:[cart.product.images[0]]
                }
            },
            quantity:cart.quantity
        };
        return line_item
    })
    return lineTerm
}

const createSession = async (
    lineItem:Stripe.Checkout.SessionCreateParams.LineItem[],
    orderId:string,
    userId:string
)=>{
     const sessionData = await STRIPE.checkout.sessions.create({
        line_items:lineItem,
        mode:"payment",
        metadata:{
            orderId
        },
        success_url: `${FRONTEND_URL}/afterpayment?success=true`,
        cancel_url: `${FRONTEND_URL}/cart?cancelled=true`
     })

     return sessionData;
}