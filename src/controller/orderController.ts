import { Request, Response } from "express";
import Stripe from "stripe";
import { changeOrderStatusSchema, OrderSchema } from "../schema/OrderSchema";
import { PrismaClient,OrderStatus } from "@prisma/client";
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
const STRIPE_ENDPOINT_SECRET=process.env.STRIPE_WEBHOOK_SECRET as string

const prismaClient = new PrismaClient()



export const stripeWebookHandler = async (req:Request,res:Response)=>{
    let event;

    try{
        const sig = req.headers["stripe-signature"]
        event = STRIPE.webhooks.constructEvent(
            req.body,
            sig as string,
            STRIPE_ENDPOINT_SECRET
        )
    }catch(error:any){
        console.log(error)
        return res.status(400).json(`webhook error : ${error.message}`)
    }

    if(event.type === "checkout.session.completed"){
        const session = event.data.object
        const productDetail = JSON.parse(session.metadata?.productDetails!)
        try {
            // Iterate through the productDetails array and update each product's quantity
            for (const { productId, quantity } of productDetail) {
                // Find the product and reduce its quantity
                const product = await prismaClient.product.findUnique({
                    where: {
                        id: productId
                    }
                });

                if (product) {
                    await prismaClient.product.update({
                        where: {
                            id: productId
                        },
                        data: {
                            quantityAvaliable: product.quantityAvaliable - quantity
                        }
                    });
                }
            }

            // Update the order status to PAID
            await prismaClient.orders.update({
                where: {
                    id:+event.data.object.metadata?.orderId!
                },
                data: {
                    status: OrderStatus.PAID
                }
            });

            res.status(200).json();
        } catch (error: any) {
            console.log(error);
            res.status(500).json(`Error updating product quantities: ${error.message}`);
        }
    }

    if(event.type === "checkout.session.expired"){
        const order = await prismaClient.orders.update({
            where:{
                id:+event.data.object.metadata?.orderId!
            },
            data:{
              status:OrderStatus.CANCELED
            }
        })
        res.status(200).json()
    }

    if(event.type === "payment_intent.canceled"){
        const order = await prismaClient.orders.update({
            where:{
                id:+event.data.object.metadata?.orderId!
            },
            data:{
              status:OrderStatus.CANCELED
            }
        })
        res.status(200).json()
    }
}


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
        const session = await createSession(lineTerm,order.id.toString(),cart,userId.toString())
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
    cart:any,
    userId:string
)=>{

     const productDetails = cart.map((cart:any)=>({
        productId:cart.productId,
        quantity:cart.quantity
     }))
     const sessionData = await STRIPE.checkout.sessions.create({
        line_items:lineItem,
        mode:"payment",
        metadata:{
            orderId,
            productDetails:JSON.stringify(productDetails)
        },
        success_url: `${FRONTEND_URL}/afterpayment?success=true`,
        cancel_url: `${FRONTEND_URL}/cart?cancelled=true`,
        
     })

     return sessionData;
}

export const GetSellerOrderHandler = async (req:Request,res:Response)=>{
       const userId = req.user.id
       const page = parseInt(req.query.page as string) || 1
       const pageSize = parseInt(req.query.pageSize as string) || 10
       const totalOrder = await prismaClient.orderProduct.count({
            where:{ProductOwner:userId}
       })
       
       const totalPages = Math.ceil(totalOrder/pageSize)

    const order = await prismaClient.orderProduct.findMany({
         where:{ProductOwner:userId},
         include:{
            Order:{include:{buyer:true}},
            product:true
         },
         skip:(page - 1) * pageSize,
         take:pageSize  
    })

    return res.status(200).json({
        order,
        currentPage:page,
        totalPages,
        totalOrder
    })

}

export const BuyerOrderHandler = async (req:Request,res:Response)=>{
      const userId = req.user.id

      const order = await prismaClient.orderProduct.findMany({
         where:{
            Order:{
                buyerId:userId
            }
         },
         include:{
            product:{
                include:{store:true}
            },
            Order:true
         }
      })

      return res.status(200).json({order})
}


export const ChangeOrderStatus = async (req:Request,res:Response)=>{
      const orderId = req.params.id
      const request = changeOrderStatusSchema.parse(req.body)
      const {status} = request

      const order = await prismaClient.orders.update({
          where:{id:+orderId},
          data:{
            status:status
          }
      })

      return res.status(200).json({message:"Order status updated!"})
}

export const DeleteOrderHandler = async (req:Request,res:Response)=>{
        const orderId = req.params.id

        return await prismaClient.$transaction(async(tx)=>{
            await tx.orderProduct.deleteMany({
                where: { orderId:+orderId }, // Assuming orderId is the foreign key in orderProduct
              });
              await tx.orderEventStatus.deleteMany({
                  where:{orderId:+orderId}
              })
              // Then, delete the order itself
              await tx.orders.delete({
                where: { id:+orderId },
              });

            
            return res.status(200).json({message:"Order deleted!"})
        }) 
}