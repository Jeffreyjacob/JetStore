import z from "zod";



export const StoreSchema = z.object({
    storeName:z.string().min(1,"store name is required"),
    storeDescription:z.string().min(1,"store discription is required") 
})