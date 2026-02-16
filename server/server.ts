import {prisma } from "../lib/prisma"
import bcrypt from "bcrypt"

export async function getUserdb(
    email:string,
    password:string){
    const user = await prisma.admin.findUnique({
        where: {
            email
        }
    })
    if(!user){
        return { user: null, isValid: false }
    }

    // Debug logging (only in development)
    if (process.env.NODE_ENV !== "production") {
      console.log("🔐 Password check:", {
        email,
        passwordLength: password.length,
        hashedPasswordPreview: user.password.substring(0, 20) + "...",
        hashedPasswordLength: user.password.length,
        userActive: user.active
      })
    }
    
    const isValid = await bcrypt.compare(password, user.password)
    
    // Only log failures in production (for debugging), never log passwords
    if (!isValid && process.env.NODE_ENV === "production") {
      console.log("❌ Authentication failed for:", email)
    } else if (process.env.NODE_ENV !== "production") {
      console.log("✅ Password match:", isValid)
    }
    
    if (!isValid) return { user: null, isValid: false }

    if (!user.active) return { user: null, isValid: false }

    return { user, isValid: true }
}