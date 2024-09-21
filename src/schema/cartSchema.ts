import z from "zod";


export const CartSchema = z.object({
    productId:z.number(),
    quantity:z.number(),
    selectedSize:z.string().min(1,"Please select a size"),
    selectedColor:z.string().min(1,"Please select a color")
})

export const ChangeQuantitySchema = z.object({
    quantity:z.number().min(1,"Please enter a quantity")
})