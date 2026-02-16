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
        return null
    }

    // Debug logging (remove in production!)
    console.log("🔐 Password check:", {
      email,
      passwordLength: password.length,
      hashedPasswordPreview: user.password.substring(0, 20) + "...",
      hashedPasswordLength: user.password.length,
      userActive: user.active
    })
    
    const isValid = await bcrypt.compare(password, user.password)
    console.log("✅ Password match:", isValid)
    
    if (!isValid) return null

    if (!user.active) return null

    return user
}