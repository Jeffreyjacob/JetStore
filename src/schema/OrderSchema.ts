import z from "zod";

const Status = z.enum(["SHIPPED","DELIEVERED","CANCELED","PAID","PLACED"])

export const OrderSchema = z.object({
    address:z.string()
})

export const changeOrderStatusSchema = z.object({
    status:Status
})