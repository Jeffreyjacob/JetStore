"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelatedProductHandler = exports.GetProductReview = exports.deleteReviewHandler = exports.AddReviewHandler = exports.DeleteProductHandler = exports.EditProductHandler = exports.GetAllProduct = exports.GetProductById = exports.GetProductByUserId = exports.CreateProductHandler = void 0;
const productSchema_1 = require("../schema/productSchema");
const cloudinary_1 = require("cloudinary");
const client_1 = require("@prisma/client");
const prismaClient = new client_1.PrismaClient();
const CreateProductHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const request = productSchema_1.productSchema.parse(req.body);
    const { name, description, category, price, quantityAvaliable, color, storeId, size } = request;
    const imagesUrl = yield uploadImages(req.files);
    const userId = req.user.id;
    const product = yield prismaClient.product.create({
        data: {
            name,
            description,
            category,
            price: parseInt(price),
            quantityAvaliable: parseInt(quantityAvaliable),
            color,
            images: imagesUrl,
            userId,
            size,
            storeId: +storeId
        }
    });
    return res.status(201).json({ product });
});
exports.CreateProductHandler = CreateProductHandler;
const GetProductByUserId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const querySearch = req.query.search || "";
    const pageSize = parseInt(req.query.pageSize) || 10;
    let query = "";
    const totalProduct = yield prismaClient.product.count({
        where: { userId }
    });
    const totalPage = Math.ceil(totalProduct / pageSize);
    if (querySearch) {
        query = querySearch;
    }
    const product = yield prismaClient.product.findMany({
        where: {
            AND: [
                { userId: userId },
                { name: { contains: query,
                        mode: "insensitive" } }
            ]
        },
        skip: (page - 1) * pageSize,
        take: pageSize
    });
    return res.status(200).json({
        product,
        totalProduct,
        totalPage,
        currentpage: page
    });
});
exports.GetProductByUserId = GetProductByUserId;
const GetProductById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const productId = req.params.id;
    const product = yield prismaClient.product.findFirstOrThrow({
        where: { id: +productId },
        include: {
            reviews: { include: { user: true } }
        }
    });
    return res.status(200).json({ product });
});
exports.GetProductById = GetProductById;
const GetAllProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield prismaClient.product.findMany();
    return res.status(200).json({ product });
});
exports.GetAllProduct = GetAllProduct;
const EditProductHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const request = productSchema_1.productSchema.parse(req.body);
    const { name, description, category, price, quantityAvaliable, color, storeId, size } = request;
    const imagesUrl = yield uploadImages(req.files);
    const userId = req.user.id;
    const productId = req.params.id;
    const product = yield prismaClient.product.update({
        where: { id: +productId },
        data: {
            name,
            description,
            category,
            price: parseInt(price),
            quantityAvaliable: parseInt(quantityAvaliable),
            color,
            images: imagesUrl,
            userId,
            size,
            storeId: +storeId
        }
    });
    return res.status(200).json({ product });
});
exports.EditProductHandler = EditProductHandler;
const DeleteProductHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const productId = req.params.id;
    const product = yield prismaClient.product.delete({
        where: { id: +productId }
    });
    return res.status(200).json({ message: "Product deleted" });
});
exports.DeleteProductHandler = DeleteProductHandler;
const AddReviewHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    const productId = req.params.id;
    const request = productSchema_1.reviewSchema.parse(req.body);
    const review = yield prismaClient.review.create({
        data: {
            reviewText: request.reviewText,
            userId,
            productId: +productId
        },
        include: {
            user: true
        }
    });
    return res.status(201).json({ review });
});
exports.AddReviewHandler = AddReviewHandler;
const deleteReviewHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const productId = req.params.id;
    const reviews = yield prismaClient.review.delete({
        where: {
            id: +productId
        }
    });
    return res.status(200).json({ reviews });
});
exports.deleteReviewHandler = deleteReviewHandler;
const GetProductReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const productId = req.params.id;
    const sortBy = req.params.sortBy || "asc";
    const review = yield prismaClient.review.findMany({
        where: {
            productId: +productId,
        },
        include: {
            user: true
        },
        orderBy: {
            createdAt: sortBy
        }
    });
    return res.status(200).json({ review });
});
exports.GetProductReview = GetProductReview;
const RelatedProductHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const productId = req.params.id;
    return yield prismaClient.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const product = yield tx.product.findFirst({
            where: { id: +productId }
        });
        const productByCategory = yield tx.product.findMany({
            where: { category: product === null || product === void 0 ? void 0 : product.category }
        });
        const relatedProducts = productByCategory.filter(p => p.id !== +productId);
        return res.status(200).json({ productByCategory: relatedProducts });
    }));
});
exports.RelatedProductHandler = RelatedProductHandler;
const uploadImages = (Files) => __awaiter(void 0, void 0, void 0, function* () {
    const uploadPromise = Files.map((file) => __awaiter(void 0, void 0, void 0, function* () {
        const base64Image = Buffer.from(file.buffer).toString("base64");
        const dataURI = `data:${file.mimetype};base64,${base64Image}`;
        const uploadedResponse = yield cloudinary_1.v2.uploader.upload(dataURI);
        return uploadedResponse.url;
    }));
    const imagesUrl = yield Promise.all(uploadPromise);
    return imagesUrl;
});
