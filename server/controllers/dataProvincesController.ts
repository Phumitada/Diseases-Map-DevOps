import type { Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

const getRiskFilter = (risk: string, totalCountField: string) => {
  switch (risk) {
    case "normal": return Prisma.sql`AND ${Prisma.raw(totalCountField)} BETWEEN 0 AND 500`;
    case "warning": return Prisma.sql`AND ${Prisma.raw(totalCountField)} BETWEEN 501 AND 3000`;
    case "emergency": return Prisma.sql`AND ${Prisma.raw(totalCountField)} > 3000`;
    default: return Prisma.sql``;
  }
};

const getSortSQL = (order: string) => {
  switch (order) {
    case "count_asc": return Prisma.sql`ORDER BY total_count ASC`;
    case "name_asc": return Prisma.sql`ORDER BY province_id ASC`;
    case "name_desc": return Prisma.sql`ORDER BY province_id DESC`;
    default: return Prisma.sql`ORDER BY total_count DESC`;
  }
};

export const getDataProvince = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = "1", limit = "9", order = "count_desc", risk = "all" } = req.query;
    const pageNumber = Math.max(Number(page), 1);
    const limitNumber = Math.max(Number(limit), 1);
    const skip = (pageNumber - 1) * limitNumber;
    const riskFilter = getRiskFilter(risk as string, "total_count");
    const sortSQL = getSortSQL(order as string);

    const rows: any[] = await prisma.$queryRaw`
      SELECT
        p.id AS province_id,
        COUNT(r.id) AS total_count,
        json_agg(json_build_object('diseaseName', d.name, 'count', dc.cnt)) AS diseases
      FROM "Province" p
      LEFT JOIN "Hospital" h ON h."provinceId" = p.id
      LEFT JOIN (
        SELECT "hospitalId", "diseaseId", COUNT(*) AS cnt
        FROM "Report"
        GROUP BY "hospitalId", "diseaseId"
      ) dc ON dc."hospitalId" = h.id
      LEFT JOIN "Disease" d ON d.id = dc."diseaseId"
      GROUP BY p.id
      HAVING COUNT(r.id) > 0
      ${riskFilter}
      ${sortSQL}
    `

    const data = rows.map(r => ({
      provinceName: r.province_id,
      totalCount: Number(r.total_count),
      diseases: (r.diseases || []).filter((d: any) => d.diseaseName),
    }))

    res.status(200).json({
      success: true,
      page: pageNumber,
      limit: limitNumber,
      risk,
      data: data.slice(skip, skip + limitNumber),
    });
  } catch (error) {
    console.error("Get Province Disease Data Error:", error);
    res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในระบบ" });
  }
};

export const getDataProvinceCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const { order = "count_desc", type = "province" } = req.query;
    const response: any = { success: true };

    if (type === "province") {
      const rows: any[] = await prisma.$queryRaw`
        SELECT p.id AS province_id, COUNT(r.id) AS total_count
        FROM "Province" p
        LEFT JOIN "Hospital" h ON h."provinceId" = p.id
        LEFT JOIN "Report" r ON r."hospitalId" = h.id
        GROUP BY p.id
        ORDER BY total_count ${order === "count_asc" ? Prisma.sql`ASC` : Prisma.sql`DESC`}
      `
      response.data = rows.map(r => ({ provinceName: r.province_id, totalCount: Number(r.total_count) }))
      response.total = rows.length

    } else if (type === "disease") {
      const rows: any[] = await prisma.$queryRaw`
        SELECT d.name AS disease_name, COUNT(r.id) AS patient_count
        FROM "Disease" d
        LEFT JOIN "Report" r ON r."diseaseId" = d.id
        GROUP BY d.id, d.name
        ORDER BY patient_count ${order === "count_asc" ? Prisma.sql`ASC` : Prisma.sql`DESC`}
      `
      response.diseaseData = rows.map(r => ({ diseaseName: r.disease_name, patientCount: Number(r.patient_count), totalCases: Number(r.patient_count) }))
      response.totalDiseases = rows.length

    } else if (type === "total") {
      response.totalPatients = await prisma.report.count()
    }

    res.status(200).json(response);
  } catch (error) {
    console.error("Get Province Count Error:", error);
    res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในระบบ" });
  }
};

export const getDataProvinceMap = async (req: Request, res: Response): Promise<void> => {
  try {
    const { order = "count_desc", risk = "all", disease } = req.query;
    const riskFilter = getRiskFilter(risk as string, "total_count");
    const sortSQL = getSortSQL(order as string);

    const rows: any[] = await prisma.$queryRaw`
      SELECT
        p.id AS province_id,
        COUNT(r.id) AS total_count,
        json_agg(json_build_object('diseaseName', d.name, 'count', dc.cnt)) AS diseases
      FROM "Province" p
      LEFT JOIN "Hospital" h ON h."provinceId" = p.id
      LEFT JOIN (
        SELECT "hospitalId", "diseaseId", COUNT(*) AS cnt
        FROM "Report"
        GROUP BY "hospitalId", "diseaseId"
      ) dc ON dc."hospitalId" = h.id
      LEFT JOIN "Disease" d ON d.id = dc."diseaseId"
      LEFT JOIN "Report" r ON r."hospitalId" = h.id
      GROUP BY p.id
      ${riskFilter}
      ${sortSQL}
    `

    const data = rows.map(r => {
      const diseases = (r.diseases || []).filter((d: any) => d.diseaseName)
      const diseaseCount = disease
        ? diseases.find((d: any) => d.diseaseName === disease)?.count || 0
        : undefined

      return {
        provinceName: r.province_id,
        totalCount: Number(r.total_count),
        diseases,
        ...(disease ? { diseaseCount: Number(diseaseCount) } : {}),
      }
    })

    const diseaseTotals: Record<string, number> = {}
    data.forEach(p => p.diseases.forEach((d: any) => {
      diseaseTotals[d.diseaseName] = (diseaseTotals[d.diseaseName] || 0) + Number(d.count)
    }))

    res.status(200).json({ success: true, risk, disease: disease || null, diseaseTotals, data });
  } catch (error) {
    console.error("Get Province Disease Data Error:", error);
    res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในระบบ" });
  }
};