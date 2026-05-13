import type { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middleware/authMiddleware";

const prisma = new PrismaClient();

export const postReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { icdCode, age, sex } = req.body;
    const tokenData = req.user;

    if (!tokenData) {
      res.status(401).json({ success: false, message: "กรุณาเข้าสู่ระบบ" });
      return;
    }

    const disease = await prisma.disease.findUnique({ where: { icdCode } });
    if (!disease) {
      res.status(400).json({ success: false, message: "ไม่พบข้อมูลโรคนี้ในระบบ" });
      return;
    }

    const newReport = await prisma.report.create({
      data: {
        hospitalId: tokenData.hospitalId,
        diseaseId: disease.id,
        age,
        sex,
      },
    });

    res.status(201).json({ success: true, message: "สร้างรายงานสำเร็จ", data: newReport });
  } catch (error) {
    console.error("Create Report Error:", error);
    res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในระบบ" });
  }
};

export const getRecentReports = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 100);

    const reports = await prisma.report.findMany({
      where: req.user ? { hospitalId: req.user.hospitalId } : {},
      orderBy: { reportAt: "desc" },
      take: limit,
      include: {
        disease: { select: { name: true, icdCode: true } },
        hospital: { select: { name: true, province: { select: { name: true } } } },
      },
    });

    res.status(200).json({ success: true, data: reports });
  } catch (error) {
    console.error("Get Recent Reports Error:", error);
    res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในระบบ" });
  }
};