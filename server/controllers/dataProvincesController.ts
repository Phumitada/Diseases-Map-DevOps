import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const getRiskFilter = (risk: string) => {
  switch (risk) {
    case "normal": return { gte: 0, lte: 500 };
    case "warning": return { gte: 501, lte: 3000 };
    case "emergency": return { gt: 3000 };
    default: return null;
  }
};

const getSortOrder = (order: string) => {
  switch (order) {
    case "count_asc": return "asc";
    case "name_asc": return "asc";
    default: return "desc";
  }
};

export const getDataProvince = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = "1", limit = "9", order = "count_desc", risk = "all" } = req.query;
    const pageNumber = Math.max(Number(page), 1);
    const limitNumber = Math.max(Number(limit), 1);
    const skip = (pageNumber - 1) * limitNumber;

    const reports = await prisma.report.groupBy({
      by: ["hospitalId", "diseaseId"],
      _count: { id: true },
    });

    const provinceMap: Record<string, { provinceName: string; totalCount: number; diseases: Record<string, number> }> = {};

    for (const r of reports) {
      const hospital = await prisma.hospital.findUnique({
        where: { id: r.hospitalId },
        include: { province: true },
      });
      const disease = await prisma.disease.findUnique({ where: { id: r.diseaseId } });
      if (!hospital || !disease) continue;

      const pName = hospital.province.id;
      if (!provinceMap[pName]) provinceMap[pName] = { provinceName: pName, totalCount: 0, diseases: {} };
      provinceMap[pName].totalCount += r._count.id;
      provinceMap[pName].diseases[disease.name] = (provinceMap[pName].diseases[disease.name] || 0) + r._count.id;
    }

    let data = Object.values(provinceMap).map(p => ({
      provinceName: p.provinceName,
      totalCount: p.totalCount,
      diseases: Object.entries(p.diseases).map(([diseaseName, count]) => ({ diseaseName, count })),
    }));

    const riskFilter = getRiskFilter(risk as string);
    if (riskFilter) {
      data = data.filter(p => {
        if (riskFilter.gte !== undefined && p.totalCount < riskFilter.gte) return false;
        if (riskFilter.lte !== undefined && p.totalCount > riskFilter.lte) return false;
        if (riskFilter.gt !== undefined && p.totalCount <= riskFilter.gt) return false;
        return true;
      });
    }

    const sortOrder = getSortOrder(order as string);
    data.sort((a, b) => order.toString().includes("name")
      ? sortOrder === "asc" ? a.provinceName.localeCompare(b.provinceName) : b.provinceName.localeCompare(a.provinceName)
      : sortOrder === "asc" ? a.totalCount - b.totalCount : b.totalCount - a.totalCount
    );

    res.status(200).json({ success: true, page: pageNumber, limit: limitNumber, risk, data: data.slice(skip, skip + limitNumber) });
  } catch (error) {
    console.error("Get Province Disease Data Error:", error);
    res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในระบบ" });
  }
};

export const getDataProvinceCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const { order = "count_desc", type = "province" } = req.query;
    const sortOrder = getSortOrder(order as string);
    const response: any = { success: true };

    if (type === "province") {
      const reports = await prisma.report.groupBy({ by: ["hospitalId"], _count: { id: true } });
      const provinceMap: Record<string, number> = {};
      for (const r of reports) {
        const hospital = await prisma.hospital.findUnique({ where: { id: r.hospitalId }, include: { province: true } });
        if (!hospital) continue;
        provinceMap[hospital.province.id] = (provinceMap[hospital.province.id] || 0) + r._count.id;
      }
      const data = Object.entries(provinceMap)
        .map(([provinceName, totalCount]) => ({ provinceName, totalCount }))
        .sort((a, b) => sortOrder === "asc" ? a.totalCount - b.totalCount : b.totalCount - a.totalCount);
      response.data = data;
      response.total = data.length;

    } else if (type === "disease") {
      const reports = await prisma.report.groupBy({ by: ["diseaseId"], _count: { id: true } });
      const data = await Promise.all(reports.map(async r => {
        const disease = await prisma.disease.findUnique({ where: { id: r.diseaseId } });
        return { diseaseName: disease?.name || "", patientCount: r._count.id, totalCases: r._count.id };
      }));
      data.sort((a, b) => sortOrder === "asc" ? a.patientCount - b.patientCount : b.patientCount - a.patientCount);
      response.diseaseData = data;
      response.totalDiseases = data.length;

    } else if (type === "total") {
      response.totalPatients = await prisma.report.count();
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
    const sortOrder = getSortOrder(order as string);

    const reports = await prisma.report.groupBy({
      by: ["hospitalId", "diseaseId"],
      _count: { id: true },
    });

    const provinceMap: Record<string, { provinceName: string; totalCount: number; diseases: Record<string, number> }> = {};

    for (const r of reports) {
      const hospital = await prisma.hospital.findUnique({ where: { id: r.hospitalId }, include: { province: true } });
      const d = await prisma.disease.findUnique({ where: { id: r.diseaseId } });
      if (!hospital || !d) continue;

      const pName = hospital.province.id;
      if (!provinceMap[pName]) provinceMap[pName] = { provinceName: pName, totalCount: 0, diseases: {} };
      provinceMap[pName].totalCount += r._count.id;
      provinceMap[pName].diseases[d.name] = (provinceMap[pName].diseases[d.name] || 0) + r._count.id;
    }

    let data = Object.values(provinceMap).map(p => ({
      provinceName: p.provinceName,
      totalCount: p.totalCount,
      diseases: Object.entries(p.diseases).map(([diseaseName, count]) => ({ diseaseName, count })),
      ...(disease ? { diseaseCount: p.diseases[disease as string] || 0 } : {}),
    }));

    const riskFilter = getRiskFilter(risk as string);
    if (riskFilter) {
      data = data.filter(p => {
        if (riskFilter.gte !== undefined && p.totalCount < riskFilter.gte) return false;
        if (riskFilter.lte !== undefined && p.totalCount > riskFilter.lte) return false;
        if (riskFilter.gt !== undefined && p.totalCount <= riskFilter.gt) return false;
        return true;
      });
    }

    data.sort((a, b) => order.toString().includes("name")
      ? sortOrder === "asc" ? a.provinceName.localeCompare(b.provinceName) : b.provinceName.localeCompare(a.provinceName)
      : sortOrder === "asc" ? a.totalCount - b.totalCount : b.totalCount - a.totalCount
    );

    const diseaseTotals: Record<string, number> = {};
    data.forEach(p => p.diseases.forEach(d => {
      diseaseTotals[d.diseaseName] = (diseaseTotals[d.diseaseName] || 0) + d.count;
    }));

    res.status(200).json({ success: true, risk, disease: disease || null, diseaseTotals, data });
  } catch (error) {
    console.error("Get Province Disease Data Error:", error);
    res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในระบบ" });
  }
};