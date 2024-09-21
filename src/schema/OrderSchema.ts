import z from "zod";


export const OrderSchema = z.object({
    address:z.string()
})