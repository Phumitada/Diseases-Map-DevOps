import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mockPrisma } from '../helper/mockPrisma'
import { getDataProvince, getDataProvinceCount, getDataProvinceMap } from '../../controllers/dataProvincesController'
import type { Request, Response } from 'express'

const mockRequest = (query = {}) => ({
  query,
}) as unknown as Request

const mockResponse = () => {
  const res = {} as Response
  res.status = vi.fn().mockReturnValue(res)
  res.json = vi.fn().mockReturnValue(res)
  return res
}

const mockReports = [
  { hospitalId: 'hospital-1', diseaseId: 1, _count: { id: 10 } },
  { hospitalId: 'hospital-2', diseaseId: 2, _count: { id: 5 } },
]

const mockHospitals = [
  { id: 'hospital-1', provinceId: 'province-1' },
  { id: 'hospital-2', provinceId: 'province-2' },
]

const mockDiseases = [
  { id: 1, name: 'COVID-19' },
  { id: 2, name: 'Dengue' },
]

beforeEach(() => {
  vi.clearAllMocks()

  mockPrisma.report.groupBy.mockResolvedValue(mockReports)
  mockPrisma.hospital.findMany.mockResolvedValue(mockHospitals)
  mockPrisma.disease.findMany.mockResolvedValue(mockDiseases)
})

describe('getDataProvince', () => {

  it('should return paginated province data', async () => {
    const req = mockRequest({ page: '1', limit: '10' })
    const res = mockResponse()

    await getDataProvince(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        page: 1,
        limit: 10,
      })
    )
  })

  it('should return correct data structure', async () => {
    const req = mockRequest({})
    const res = mockResponse()

    await getDataProvince(req, res)

    const responseData = (res.json as any).mock.calls[0][0]
    expect(responseData.success).toBe(true)
    expect(Array.isArray(responseData.data)).toBe(true)
  })

  it('should filter by risk normal', async () => {
    const req = mockRequest({ risk: 'normal' })
    const res = mockResponse()

    await getDataProvince(req, res)

    const responseData = (res.json as any).mock.calls[0][0]
    expect(responseData.success).toBe(true)
    expect(responseData.risk).toBe('normal')
  })

  it('should handle database error', async () => {
    mockPrisma.report.groupBy.mockRejectedValue(new Error('DB Error'))

    const req = mockRequest({})
    const res = mockResponse()

    await getDataProvince(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
      })
    )
  })

})

describe('getDataProvinceCount', () => {

  it('should return total patient count when type is total', async () => {
    mockPrisma.report.count.mockResolvedValue(100)

    const req = mockRequest({ type: 'total' })
    const res = mockResponse()

    await getDataProvinceCount(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    const responseData = (res.json as any).mock.calls[0][0]
    expect(responseData.success).toBe(true)
    expect(responseData.totalPatients).toBe(100)
  })

  it('should return disease count when type is disease', async () => {
    const req = mockRequest({ type: 'disease' })
    const res = mockResponse()

    await getDataProvinceCount(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    const responseData = (res.json as any).mock.calls[0][0]
    expect(responseData.success).toBe(true)
    expect(Array.isArray(responseData.diseaseData)).toBe(true)
  })

  it('should return province count when type is province', async () => {
    const req = mockRequest({ type: 'province' })
    const res = mockResponse()

    await getDataProvinceCount(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    const responseData = (res.json as any).mock.calls[0][0]
    expect(responseData.success).toBe(true)
    expect(Array.isArray(responseData.data)).toBe(true)
  })

  it('should handle database error', async () => {
    mockPrisma.report.groupBy.mockRejectedValue(new Error('DB Error'))

    const req = mockRequest({ type: 'province' })
    const res = mockResponse()

    await getDataProvinceCount(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
  })

})

describe('getDataProvinceMap', () => {

  it('should return map data successfully', async () => {
    const req = mockRequest({})
    const res = mockResponse()

    await getDataProvinceMap(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    const responseData = (res.json as any).mock.calls[0][0]
    expect(responseData.success).toBe(true)
    expect(Array.isArray(responseData.data)).toBe(true)
  })

  it('should filter by disease when provided', async () => {
    const req = mockRequest({ disease: 'COVID-19' })
    const res = mockResponse()

    await getDataProvinceMap(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    const responseData = (res.json as any).mock.calls[0][0]
    expect(responseData.disease).toBe('COVID-19')
  })

  it('should return diseaseTotals in response', async () => {
    const req = mockRequest({})
    const res = mockResponse()

    await getDataProvinceMap(req, res)

    const responseData = (res.json as any).mock.calls[0][0]
    expect(responseData).toHaveProperty('diseaseTotals')
  })

  it('should handle database error', async () => {
    mockPrisma.report.groupBy.mockRejectedValue(new Error('DB Error'))

    const req = mockRequest({})
    const res = mockResponse()

    await getDataProvinceMap(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
  })

})