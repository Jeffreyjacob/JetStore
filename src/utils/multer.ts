import multer from "multer";


const storage = multer.memoryStorage()

export const upload = multer({
    storage,
    limits:{
        files:5 * 1024 * 1024
    }
})