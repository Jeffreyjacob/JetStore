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
exports.EditStoreHandler = exports.GetStoreHandler = exports.CreateStoreHandler = void 0;
const client_1 = require("@prisma/client");
const cloudinary_1 = require("cloudinary");
const storeSchema_1 = require("../schema/storeSchema");
const prismaClient = new client_1.PrismaClient();
const CreateStoreHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    const request = storeSchema_1.StoreSchema.parse(req.body);
    const { storeName, storeDescription } = request;
    const imageUrl = yield uploadImage(req.file);
    const store = yield prismaClient.store.create({
        data: {
            storeName,
            storeDescription,
            storeImage: imageUrl,
            storeOwnerId: userId
        }
    });
    return res.status(201).json(store);
});
exports.CreateStoreHandler = CreateStoreHandler;
const GetStoreHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    const store = yield prismaClient.store.findFirstOrThrow({
        where: { storeOwnerId: userId },
        include: {
            product: true
        }
    });
    return res.status(200).json({ store });
});
exports.GetStoreHandler = GetStoreHandler;
const EditStoreHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const request = storeSchema_1.StoreSchema.parse(req.body);
    const { storeName, storeDescription } = request;
    const id = req.params.id;
    const imageUrl = yield uploadImage(req.file);
    const store = yield prismaClient.store.update({
        where: {
            id: +id
        },
        data: {
            storeName,
            storeDescription,
            storeImage: imageUrl,
        }
    });
    return res.status(200).json({ store });
});
exports.EditStoreHandler = EditStoreHandler;
const uploadImage = (File) => __awaiter(void 0, void 0, void 0, function* () {
    const base64Image = Buffer.from(File.buffer).toString("base64");
    const dataURI = `data:${File.mimetype};base64,${base64Image}`;
    const uploadResponse = yield cloudinary_1.v2.uploader.upload(dataURI);
    return uploadResponse.url;
});
