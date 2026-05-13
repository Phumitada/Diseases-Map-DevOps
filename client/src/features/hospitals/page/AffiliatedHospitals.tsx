import { useState, useMemo, useEffect } from "react";
import {
  Building2,
  Search,
  MapPin,
  Phone,
  Activity,
  Plus,
  ChevronRight,
  Hospital,
  Crosshair,
  ShieldCheck,
  ArrowUpRight,
} from "lucide-react";
import type { IHospital } from "../../../../../shared/types/schema/hospital";
import apiClient from "../../../api/apiClient";
import Dropdown from "../../../components/Dropdown";
import Pagination from "../../../components/Pagination"; 

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AffiliatedHospitals() {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [isAdding, setIsAdding] = useState(false);
  const [facilities, setFacilities] = useState<IHospital[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 6,
    totalPages: 0,
  });

  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [search, filterType]);

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    category: "General Hospital",
    provinceId: "Bangkok Metropolis",
    beds: "",
    phone: "",
    emergency: "",
  });

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get("/hospital", {
          params: {
            search: search || undefined,
            provinceId: filterType === "All" ? undefined : filterType,
            limit: pagination.limit,
            page: pagination.page,
          },
        });

        setFacilities(response.data.data || []);
        setPagination(response.data.pagination || pagination);
      } catch (error) {
        console.error("Failed to fetch hospitals:", error);
        setFacilities([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchHospitals();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, filterType, pagination.page]);

  const stats = useMemo(() => {
    const totalFacilities = pagination.total; 
    const totalBeds = facilities.reduce(
      (sum, f) => sum + (Number(f.beds) || 0),
      0
    );
    const activeFacilities = facilities.filter(
      (f) => f.status === "Active"
    ).length;
    const activePercentage =
      facilities.length > 0
        ? ((activeFacilities / facilities.length) * 100).toFixed(1)
        : "0.0";

    return {
      totalFacilities,
      totalBeds,
      activePercentage,
      estimatedStaff: Math.floor(totalBeds * 3.5),
    };
  }, [facilities, pagination.total]);

  // ฟังก์ชันสำหรับเปลี่ยนหน้า
  const handlePageChange = (newPage: number) => {
    setPagination({ ...pagination, page: newPage });
    // Scroll to top เมื่อเปลี่ยนหน้า
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Options สำหรับ dropdowns
  const categoryOptions = [
    { value: "General Hospital", label: "โรงพยาบาลทั่วไป (General)" },
    { value: "Private Hospital", label: "โรงพยาบาลเอกชน (Private)" },
    { value: "Health Center", label: "ศูนย์อนามัย (Health Center)" },
    {
      value: "University Hospital",
      label: "โรงพยาบาลมหาวิทยาลัย (University)",
    },
  ];

  const provinceOptions = [
    { value: "Bangkok Metropolis", label: "กรุงเทพมหานคร" },
    { value: "Chiang Mai", label: "เชียงใหม่" },
    { value: "Nonthaburi", label: "นนทบุรี" },
    { value: "Khon Kaen", label: "ขอนแก่น" },
    { value: "Songkhla", label: "สงขลา" },
    { value: "Phitsanulok", label: "พิษณุโลก" },
  ];

  const filterOptions = [
    { value: "All", label: "ทุกจังหวัด" },
    ...provinceOptions,
  ];

  return (
    <div className="pb-32 px-8 max-w-[1400px] mx-auto min-h-screen pt-12">
      {/* Header Section - Official Look */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-16 animate-fade-in border-b border-slate-200 pb-12 text-left">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-medical-green-50 text-medical-green-700 rounded text-[10px] font-black uppercase tracking-[0.2em] border border-medical-green-100">
            <Hospital className="w-3 h-3" />
            ศูนย์เครือข่ายสถานพยาบาล
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight font-heading">
            เครือข่ายสถานพยาบาล
          </h1>
          <p className="text-slate-500 font-medium text-lg max-w-2xl">
            การประสานงานสถานพยาบาลและหน่วยงานสาธารณสุขในเครื่อข่ายกรมควบคุมโรค
            เพื่อการจัดการทรัพยากรและการเตรียมความพร้อมอย่างเป็นระบบ
          </p>
        </div>
        <div>
          <button
            onClick={() => setIsAdding(true)}
            className="px-8 py-4 bg-medical-green-900 rounded-md text-[12px] font-black uppercase tracking-widest text-white hover:bg-medical-green-800 transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/10"
          >
            <Plus className="w-4 h-4" />
            ลงทะเบียนสถานพยาบาล
          </button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {[
          {
            label: "หน่วยงานทั้งหมด",
            val: stats.totalFacilities.toLocaleString(),
            icon: Building2,
          },
          {
            label: "เตียงในหน้านี้",
            val: stats.totalBeds.toLocaleString(),
            icon: Crosshair,
          },
          {
            label: "ความพร้อมระบบ",
            val: `${stats.activePercentage}%`,
            icon: Activity,
          },
          {
            label: "เจ้าหน้าที่ประมาณการ",
            val: stats.estimatedStaff.toLocaleString(),
            icon: ShieldCheck,
          },
        ].map((s, i) => (
          <div
            key={i}
            className="bg-white border border-slate-200 p-6 rounded-md shadow-official flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded bg-medical-green-50 text-medical-green-700 flex items-center justify-center">
              <s.icon className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {s.label}
              </p>
              <p className="text-xl font-black text-slate-900">{s.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Structured Search/Filter Area */}
      <div className="bg-white border border-slate-200 rounded-md p-6 mb-12 shadow-official flex flex-col md:flex-row gap-6">
        <div className="relative flex-grow group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-medical-green-600 transition-colors w-4 h-4" />
          <input
            type="text"
            placeholder="ค้นหาชื่อหน่วยงาน หรือ จังหวัดที่ตั้ง..."
            className="w-full pl-12 pr-6 py-3.5 rounded-md bg-slate-50 border border-slate-100 focus:border-medical-green-600 focus:bg-white focus:ring-4 focus:ring-medical-green-600/5 outline-none transition-all font-bold text-slate-700 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="min-w-[240px]">
          <Dropdown
            value={filterType}
            onChange={setFilterType}
            options={filterOptions}
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <div className="text-medical-green-600 font-bold">
            กำลังโหลดข้อมูล...
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && facilities.length === 0 && (
        <div className="text-center py-20">
          <Hospital className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-400 font-bold">ไม่พบข้อมูลสถานพยาบาล</p>
        </div>
      )}

      {/* List of Facilities */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {facilities.map((f) => (
          <div
            key={f.id}
            className="official-card p-8 group flex flex-col gap-6 text-left hover:border-medical-green-600/30 transition-all duration-300"
          >
            <div className="flex justify-between items-start">
              <span
                className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest border ${
                  f.status === "Active"
                    ? "bg-medical-green-50 text-medical-green-700 border-medical-green-100"
                    : "bg-slate-50 text-slate-400 border-slate-100"
                }`}
              >
                {f.status}
              </span>
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-300" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {f.province?.name || f.provinceId}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xl font-black text-slate-900 group-hover:text-medical-green-900 transition-colors leading-tight min-h-[3rem] flex items-center">
                {f.name}
              </h3>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                {f.category}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 py-6 border-y border-slate-50">
              <div>
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">
                  ศักยภาพ
                </p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-black text-slate-800">
                    {Number(f.beds).toLocaleString()}
                  </span>
                  <span className="text-[10px] font-bold text-slate-300">
                    เตียง
                  </span>
                </div>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">
                  ฉุกเฉิน
                </p>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      f.emergency === "Full"
                        ? "bg-rose-500"
                        : f.emergency === "High"
                        ? "bg-amber-500"
                        : "bg-medical-green-500"
                    }`}
                  />
                  <span className="text-[11px] font-black text-slate-700 uppercase">
                    {f.emergency}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-medical-green-600" />
                <span className="text-[12px] font-bold text-slate-600">
                  {f.phone}
                </span>
              </div>
              <button className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center text-medical-green-900 hover:bg-medical-green-900 hover:text-white transition-all">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Component */}
      {!isLoading && facilities.length > 0 && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {/* Registration Modal Overlay */}
      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-md shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-in text-left">
            <div className="bg-medical-green-900 p-8 flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-white font-black text-xl uppercase tracking-tight">
                  ลงทะเบียนหน่วยงาน
                </h3>
                <p className="text-medical-green-200/50 text-[10px] font-black uppercase tracking-widest">
                  พอร์ทัลลงทะเบียนเครือข่าย
                </p>
              </div>
              <button
                onClick={() => setIsAdding(false)}
                className="text-white/50 hover:text-white transition-colors"
              >
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>

            <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* รหัสหน่วยงาน */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  รหัสหน่วยงาน *
                </label>
                <input
                  type="text"
                  placeholder="H-XXXXX"
                  value={formData.id}
                  onChange={(e) =>
                    setFormData({ ...formData, id: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-100 rounded py-3.5 px-4 text-sm font-bold text-slate-700 outline-none focus:border-medical-green-600 transition-all"
                />
              </div>

              {/* ชื่อหน่วยงาน */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  ชื่อหน่วยงาน (ภาษาไทย) *
                </label>
                <input
                  type="text"
                  placeholder="ระบุชื่อหน่วยงานระดับทางการ..."
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-100 rounded py-3.5 px-4 text-sm font-bold text-slate-700 outline-none focus:border-medical-green-600 transition-all"
                />
              </div>

              {/* ประเภทสถานพยาบาล */}
              <Dropdown
                label="ประเภทสถานพยาบาล"
                value={formData.category}
                onChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
                options={categoryOptions}
              />

              {/* จังหวัดที่ตั้ง */}
              <Dropdown
                label="จังหวัดที่ตั้ง"
                value={formData.provinceId}
                onChange={(value) =>
                  setFormData({ ...formData, provinceId: value })
                }
                options={provinceOptions}
              />

              {/* จำนวนเตียง */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  จำนวนเตียง
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={formData.beds}
                  onChange={(e) =>
                    setFormData({ ...formData, beds: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-100 rounded py-3.5 px-4 text-sm font-bold text-slate-700 outline-none focus:border-medical-green-600 transition-all"
                />
              </div>

              {/* เบอร์ติดต่อ */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  เบอร์ติดต่อฉุกเฉิน
                </label>
                <input
                  type="text"
                  placeholder="XX-XXX-XXXX"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-100 rounded py-3.5 px-4 text-sm font-bold text-slate-700 outline-none focus:border-medical-green-600 transition-all"
                />
              </div>
            </div>

            <div className="px-10 py-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-6">
              <button
                onClick={() => setIsAdding(false)}
                className="text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-all"
              >
                ยกเลิก
              </button>
              <button className="px-10 py-4 bg-medical-green-900 text-white rounded font-black text-[12px] uppercase tracking-widest shadow-lg shadow-emerald-900/20 hover:bg-medical-green-800 transition-all flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4" />
                ยืนยันการลงทะเบียน
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}