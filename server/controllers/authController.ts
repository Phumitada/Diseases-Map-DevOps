import type { Request,Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { AuthRequest } from "../middleware/authMiddleware";

const prisma = new PrismaClient()

export const Login = async(req:Request,res:Response):Promise<void> => {
    try {
        const { username,password } = req.body
        if(!username || !password){
            res.status(400).json({message:"กรุณากรอกข้อมูลให้ครบ"})
            return
        }
        const user = await prisma.user.findUnique({
            where:{username:username},
            include:{ 
                hospital: 
                {include: 
                    { province: true }}}}
        )
        if(!user){
            res.status(400).json({message:"รหัสผ่านหรือไอดีไม่ถูกต้อง"})
            return
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid){
            res.status(400).json({message:"รหัสผ่านไม่ถูกต้อง"})
            return
        }
        const payload = {
            userId: user.id,
            username: user.username,
            hospitalId: user.hospitalId,
            hospitalName: user.hospital.name,
            provinceId: user.hospital.provinceId,
            provinceName: user.hospital.province.name
        };
        const secretKey = process.env.JWT_SECRET || 'fallback_secret';
        const token = jwt.sign(
            payload,
            secretKey,
            { expiresIn: '7d' }
        );
        res.status(200).json({ 
            message: "เข้าสู่ระบบสำเร็จ",
            token, 
            payload 
        });
    } catch (error) {
        console.log(error)
        res.status(400).json({message:"เข้าสู่ระบบไม่สําเร็จ"})
    }
}


export const checkMe = async (req:AuthRequest,res:Response):Promise<void> => {
    try {
        if (!req.user) {
            res.status(200).json({ 
                isAuthenticated: false, 
                role: 'guest',
                hospital: null 
            });
            return;
        }
        res.status(200).json({
            isAuthenticated: true,
            role: 'hospital',
            hospital: req.user
        });
    } catch (error) {
        console.log(error)
        res.status(400)
    }
}