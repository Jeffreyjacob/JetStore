import z from "zod";


export const wishlistSchema = z.object({
    productId:z.number()
})