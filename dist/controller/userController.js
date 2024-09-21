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
exports.RemoveAddressHandler = exports.AddAddressHandler = exports.UpdateUserProfile = exports.AuthUserHandler = void 0;
const client_1 = require("@prisma/client");
const userSchema_1 = require("../schema/userSchema");
const cloudinary_1 = require("cloudinary");
const prismaClient = new client_1.PrismaClient();
const AuthUserHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    const user = yield prismaClient.user.findFirst({
        where: { id: userId },
        include: {
            address: true,
            store: true,
            cart: { include: { product: true } }
        }
    });
    return res.status(200).json(Object.assign(Object.assign({}, user), { password: undefined }));
});
exports.AuthUserHandler = AuthUserHandler;
const UpdateUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.file);
    const userId = req.user.id;
    const request = userSchema_1.UserSchema.parse(req.body);
    const profileImageUrl = yield uploadImage(req.file);
    const user = yield prismaClient.user.update({
        where: { id: userId },
        data: {
            fullname: request.fullName,
            profilePicture: profileImageUrl
        },
        include: {
            address: true,
            store: true,
        }
    });
    return res.status(200).json(Object.assign(Object.assign({}, user), { password: undefined }));
});
exports.UpdateUserProfile = UpdateUserProfile;
const AddAddressHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    const request = userSchema_1.addressSchema.parse(req.body);
    const { lineOne, lineTwo, city, country } = request;
    const address = yield prismaClient.address.create({
        data: {
            lineOne,
            lineTwo,
            city,
            country,
            userId
        }
    });
    return res.status(201).json({ address });
});
exports.AddAddressHandler = AddAddressHandler;
const RemoveAddressHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    const addressId = req.params.id;
    const address = yield prismaClient.address.delete({
        where: { id: +addressId }
    });
    return res.status(200).json({ address });
});
exports.RemoveAddressHandler = RemoveAddressHandler;
const uploadImage = (file) => __awaiter(void 0, void 0, void 0, function* () {
    const base64Image = Buffer.from(file.buffer).toString("base64");
    const dataURI = `data:${file.mimetype};base64,${base64Image}`;
    const uploadedImage = yield cloudinary_1.v2.uploader.upload(dataURI);
    return uploadedImage.url;
});
