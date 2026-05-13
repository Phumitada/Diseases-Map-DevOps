import { useEffect, useState } from "react";
import { Activity, MapPin, Hospital, Clock, RefreshCw } from "lucide-react";
import apiClient from "../../../api/apiClient";

interface RecentReport {
  id: number
  disease: { name: string; icdCode: string }
  hospital: { name: string; province: { name: string } }
  reportAt: string
  sex: string
  age: number
}
export default function Statistics() {
  const [reports, setReports] = useState<RecentReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get("/report/recent?limit=50");
      setReports(res.data.data || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-medical-green-100 rounded-lg">
                <Activity className="w-6 h-6 text-medical-green-700" />
              </div>
              <h1 className="text-2xl font-bold text-slate-800">
                ประวัติการรายงานโรคของฉัน
              </h1>
            </div>
            <p className="text-slate-500 ml-14">
              แสดงรายการที่คุณเพิ่มรายงาน 50 รายการล่าสุด
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <button
              onClick={fetchReports}
              disabled={isLoading}
              className="flex items-center gap-1.5 text-sm text-medical-green-700 hover:text-medical-green-900 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              รีเฟรช
            </button>
            {lastUpdated && (
              <span className="text-xs text-slate-400">
                อัปเดตเมื่อ {lastUpdated.toLocaleTimeString("th-TH")}
              </span>
            )}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-slate-400">
              <Activity className="w-5 h-5 animate-spin mr-2" />
              กำลังโหลดข้อมูล...
            </div>
          ) : reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Activity className="w-10 h-10 mb-3 opacity-40" />
              <p>ยังไม่มีข้อมูลรายงาน</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-5 py-3 text-slate-500 font-medium">#</th>
                    <th className="text-left px-5 py-3 text-slate-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5" />
                        โรค
                      </div>
                    </th>
                    <th className="text-left px-5 py-3 text-slate-500 font-medium">ICD-10</th>
                    <th className="text-left px-5 py-3 text-slate-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        จังหวัด
                      </div>
                    </th>
                    <th className="text-left px-5 py-3 text-slate-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Hospital className="w-3.5 h-3.5" />
                        โรงพยาบาล
                      </div>
                    </th>
                    <th className="text-left px-5 py-3 text-slate-500 font-medium">เพศ / อายุ</th>
                    <th className="text-left px-5 py-3 text-slate-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        วันที่รายงาน
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r, i) => (
                    <tr
                      key={r.id}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-5 py-3.5 text-slate-400 font-mono text-xs">{i + 1}</td>
                      <td className="px-5 py-3.5 font-medium text-slate-800">{r.disease.name}</td>
                      <td className="px-5 py-3.5">
                        <span className="bg-medical-green-50 text-medical-green-700 text-xs font-mono px-2 py-0.5 rounded">
                          {r.disease.icdCode}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-700">{r.hospital.province.name}</td>
                      <td className="px-5 py-3.5 text-slate-600 text-xs">{r.hospital.name}</td>
                      <td className="px-5 py-3.5 text-slate-600">{r.sex} / {r.age} ปี</td>
                      <td className="px-5 py-3.5 text-slate-400 text-xs">{formatDate(r.reportAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="text-center text-slate-400 text-xs mt-4">
          แสดง {reports.length} รายการที่คุณเพิ่ม
        </p>
      </div>
    </div>
  );
}
