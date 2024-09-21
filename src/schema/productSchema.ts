import z from "zod";

const Category = z.enum([ "CLOTHIES","ACCESSERIES","SHOES","BAGS"])

export const productSchema = z.object({
    name: z.string().min(1, "product name is required"),
    description: z.string().min(1, "product description is required"),
    price: z.string(),
    quantityAvaliable: z.string(),
    color: z.union([z.string(), z.array(z.string().min(1, "please add a color"))])
    .transform((val) => (typeof val === 'string' ? [val] : val)), 
    category:Category,
    storeId:z.string(),
    size: z.union([z.string(), z.array(z.string().min(1, "please add a size"))])
    .transform((val) => (typeof val === 'string' ? [val] : val)), 
})

export const reviewSchema = z.object({
   reviewText:z.string().min(1,"leave a review")
})