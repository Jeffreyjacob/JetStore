"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateCookie = void 0;
const GenerateCookie = (token, res) => {
    return res.cookie("token", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "strict",
    });
};
exports.GenerateCookie = GenerateCookie;
