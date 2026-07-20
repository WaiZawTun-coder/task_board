import {z} from "zod";

export const registerSchema = z.object({
    email: z.email({ message: "Invalid email address"}),
    username: z.string().min(3, {message: "Username must be at least 3 characters long"}),
    password: z.string().min(8, {message: "Password must be at least 8 characters long"}),
})