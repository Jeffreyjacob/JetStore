import z from "zod";

const Role = z.enum(["SELLER","BUYER"])

export const SignupSchema = z.object({
    fullName:z.string().min(1,"name is required"),
    email:z.string().email("Invalid Email").min(1,"email is required"),
    password:z.string().min(6,"Your Password must be at least 6 characters"),
    role:Role
})

export const LoginSchema = z.object({
    email:z.string().email("Invalid Email").min(1,"email is required"),
    password:z.string().min(6,"Your Password must be at least 6 characters"),
})

export const ForgetPasswordSchem = z.object({
    email:z.string().email("Invalid Email").min(1,"email is required"),
})

export const ResetpasswordSchema = z.object({
    password:z.string().min(6,"Your password must be at least 6 characters")
})

export const UserSchema = z.object({
    fullName:z.string().min(1,"name")
})

export const addressSchema = z.object({
  lineOne:z.string().min(1,"Please enter street "),
  lineTwo:z.string(),
  city:z.string().min(1,"please enter your city"),
  country:z.string().min(1,"please enter your country")
})