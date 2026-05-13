import { useState, useEffect } from "react";
import apiClient from "../api/apiClient";
import { useAuthStore } from "../stores/authStore";

import {
    Activity,
    ShieldCheck,
    Info,
    Hospital,
    ClipboardList,
    MapPin,
    Send,
    Edit,
    ChevronDown,
    Plus
} from "lucide-react";

interface FacilityData {
    code: string;
    name: string;
    province: string;
}

export default function PatientReporting() {
    const [facility, setFacility] = useState<FacilityData | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [modalCode, setModalCode] = useState("");
    const [modalName, setModalName] = useState("");
    const [modalProvince, setModalProvince] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);
    const token = useAuthStore((state) => state.token);

    const [reportDate, setReportDate] = useState(new Date().toLocaleDateString("th-TH"));
    const [diseaseGroup, setDiseaseGroup] = useState("กลุ่มโรคติดต่อทางระบบทางเดินหายใจ");
    const [diseaseName, setDiseaseName] = useState("");
    const [icd10, setIcd10] = useState("");
    const [newCases, setNewCases] = useState("");
    const [totalCases, setTotalCases] = useState("");
    const [deaths, setDeaths] = useState("");
    const [severity, setSeverity] = useState("normal");
    const [remarks, setRemarks] = useState("");
    const [coords, setCoords] = useState("13.7563, 100.5018 — กรุงเทพมหานคร");
    const [age, setAge] = useState("");
    const [sex, setSex] = useState("");


    useEffect(() => {
        const saved = localStorage.getItem("moph_facility_profile");
        if (saved) {
            setFacility(JSON.parse(saved));
        } else {
            setTimeout(() => setShowModal(true), 500);
        }
    }, []);

    const saveFacility = () => {
        if (!modalCode || !modalName) return;
        const data = { code: modalCode, name: modalName, province: modalProvince };
        localStorage.setItem("moph_facility_profile", JSON.stringify(data));
        setFacility(data);
        setShowModal(false);
    };

    const handleSubmit = async (e: React.BaseSyntheticEvent) => {
        e.preventDefault();
        if (!token) {
            return;
        }
        try {
            setIsSubmitted(true);
            await apiClient.post("/report", {
                icdCode: icd10,  
                age: Number(age),
                sex: sex,
            });
            alert("ส่งรายงานสำเร็จ");
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            alert(message || "เกิดข้อผิดพลาด");
        } finally {
            setIsSubmitted(false);
        }
    };


    const getGPS = () => {
        setCoords("กำลังดึงข้อมูลพิกัด...");
        setTimeout(() => {
            setCoords("13.7367, 100.5231 — ปทุมวัน, กรุงเทพมหานคร");
        }, 1000);
    };

    return (
        <div className="pb-32 px-8 max-w-[1000px] mx-auto min-h-screen pt-12 animate-fade-in text-left">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-12 border-b border-slate-200 pb-10">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-medical-green-50 text-medical-green-700 rounded text-[10px] font-black uppercase tracking-[0.2em] border border-medical-green-100">
                        <ClipboardList className="w-3 h-3" />
                        System Registry Service
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight font-heading">
                        รายงานสถานการณ์โรค
                    </h1>
                    <p className="text-slate-500 font-medium text-lg max-w-2xl">
                        แบบรายงานข้อมูลสถานการณ์ระบาดรายวัน เพื่อการเฝ้าระวังและวิเคราะห์ทางระบาดวิทยา
                        สำหรับเจ้าหน้าสาธารณสุขและหน่วยงานเครือข่าย
                    </p>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-md shadow-official overflow-hidden">
                <div className="bg-medical-green-50/50 border-b border-medical-green-100 p-6 flex gap-4 items-start">
                    <Info className="w-5 h-5 text-medical-green-600 mt-0.5" />
                    <p className="text-slate-600 text-[13px] font-medium leading-relaxed">
                        <strong className="font-black text-medical-green-900">คำชี้แจง:</strong> ข้อมูลนี้จะถูกนำไปประมวลผลเพื่อกำหนดนโยบายสาธารณสุขระดับประเทศ โปรดตรวจสอบความถูกต้องของรหัส ICD-10/11 ก่อนทำการบันทึกทุกครั้ง
                    </p>
                </div>
                <form onSubmit={handleSubmit} className="p-10 space-y-16">
                    <div className="space-y-8">
                        <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                            <span className="w-7 h-7 rounded bg-medical-green-900 text-white flex items-center justify-center font-black text-[10px]">01</span>
                            <h2 className="text-[12px] font-black text-medical-green-900 uppercase tracking-widest">ข้อมูลหน่วยงานรายงาน</h2>
                        </div>

                        {facility ? (
                            <div className="bg-slate-50 border border-slate-100 rounded-md p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded bg-white flex items-center justify-center text-medical-green-900 shadow-sm border border-slate-100">
                                        <Hospital className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-black text-slate-900 text-sm">{facility.name}</h3>
                                        <p className="text-[11px] font-black text-slate-400 mt-0.5 uppercase tracking-widest">
                                            Code: <span className="text-medical-green-700">{facility.code}</span> • Region: {facility.province || "Thailand"}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setModalCode(facility.code);
                                        setModalName(facility.name);
                                        setModalProvince(facility.province);
                                        setShowModal(true);
                                    }}
                                    className="text-[11px] font-black text-medical-green-700 bg-white px-5 py-2.5 rounded border border-medical-green-100 shadow-sm hover:shadow-md transition-all flex items-center gap-2 uppercase tracking-widest"
                                >
                                    <Edit className="w-3.5 h-3.5" />
                                    Edit Profile
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setShowModal(true)}
                                className="w-full py-12 border-2 border-dashed border-slate-200 rounded-md flex flex-col items-center gap-4 text-slate-300 hover:text-medical-green-600 hover:border-medical-green-300 transition-all bg-slate-50 group"
                            >
                                <Plus className="w-10 h-10 group-hover:scale-110 transition-transform" />
                                <span className="text-[11px] font-black uppercase tracking-widest">Setup Official Facility Profile</span>
                            </button>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Reporting Date</label>
                                <input
                                    required
                                    type="text"
                                    value={reportDate}
                                    onChange={(e) => setReportDate(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-100 rounded py-3.5 px-6 font-bold text-sm text-slate-700 outline-none focus:border-medical-green-600 transition-all font-mono"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Document Status</label>
                                <div className="w-full bg-slate-100 border border-slate-100 rounded py-3.5 px-6 font-black text-[11px] text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-medical-green-500" />
                                    Official Digital Submission
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-8">
                        <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                            <span className="w-7 h-7 rounded bg-medical-green-900 text-white flex items-center justify-center font-black text-[10px]">02</span>
                            <h2 className="text-[12px] font-black text-medical-green-900 uppercase tracking-widest">ประเภทโรคและสถิติ</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                            <div className="md:col-span-8 space-y-3">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Disease Classification</label>
                                <div className="relative">
                                    <select
                                        className="w-full appearance-none bg-slate-50 border border-slate-100 rounded py-3.5 px-6 text-sm font-bold text-slate-700 outline-none focus:border-medical-green-600 transition-all cursor-pointer"
                                        value={diseaseGroup}
                                        onChange={(e) => setDiseaseGroup(e.target.value)}
                                    >
                                        <option>กลุ่มโรคติดต่อทางระบบทางเดินหายใจ</option>
                                        <option>กลุ่มโรคติดต่อนำโดยแมลง</option>
                                        <option>กลุ่มภัยสุขภาพ (ฝุ่นละออง / มลพิษ)</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4 pointer-events-none" />
                                </div>
                            </div>

                            <div className="md:col-span-4 space-y-3">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">ICD-10 Code</label>
                                <input
                                    type="text"
                                    placeholder="e.g. A90"
                                    className="w-full bg-slate-50 border border-slate-100 rounded py-3.5 px-6 font-bold text-sm text-slate-700 outline-none focus:border-medical-green-600 transition-all font-mono uppercase tracking-widest"
                                    value={icd10}
                                    onChange={(e) => setIcd10(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Official Disease Name (TH)</label>
                            <input
                                required
                                type="text"
                                placeholder="เช่น ไข้เลือดออก (Dengue), COVID-19..."
                                className="w-full bg-slate-50 border border-slate-100 rounded py-3.5 px-6 font-bold text-sm text-slate-700 outline-none focus:border-medical-green-600 transition-all"
                                value={diseaseName}
                                onChange={(e) => setDiseaseName(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Age</label>
                                <input
                                    required
                                    type="number"
                                    placeholder="อายุผู้ป่วย"
                                    className="w-full bg-slate-50 border border-slate-100 rounded py-3.5 px-6 font-bold text-sm text-slate-700 outline-none focus:border-medical-green-600 transition-all"
                                    value={age}
                                    onChange={(e) => setAge(e.target.value)}
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Sex</label>
                                <div className="relative">
                                    <select
                                        required
                                        className="w-full appearance-none bg-slate-50 border border-slate-100 rounded py-3.5 px-6 text-sm font-bold text-slate-700 outline-none focus:border-medical-green-600 transition-all cursor-pointer"
                                        value={sex}
                                        onChange={(e) => setSex(e.target.value)}
                                    >
                                        <option value="">เลือกเพศ</option>
                                        <option value="male">ชาย</option>
                                        <option value="female">หญิง</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                            <div className="bg-slate-50/50 p-6 rounded border border-slate-100 space-y-4">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">New Cases</p>
                                <input
                                    required
                                    type="number"
                                    placeholder="0"
                                    className="w-full bg-transparent border-none text-4xl font-black text-slate-900 focus:ring-0 p-0 tabular-nums"
                                    value={newCases}
                                    onChange={(e) => setNewCases(e.target.value)}
                                />
                            </div>
                            <div className="bg-slate-50/50 p-6 rounded border border-slate-100 space-y-4">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Cumulative</p>
                                <input
                                    type="number"
                                    placeholder="0"
                                    className="w-full bg-transparent border-none text-4xl font-black text-slate-900 focus:ring-0 p-0 tabular-nums"
                                    value={totalCases}
                                    onChange={(e) => setTotalCases(e.target.value)}
                                />
                            </div>
                            <div className="bg-slate-50/50 p-6 rounded border border-slate-100 space-y-4">
                                <p className="text-[9px] font-black text-rose-400 uppercase tracking-[0.2em]">Confirmed Fatalities</p>
                                <input
                                    type="number"
                                    placeholder="0"
                                    className="w-full bg-transparent border-none text-4xl font-black text-rose-600 focus:ring-0 p-0 tabular-nums"
                                    value={deaths}
                                    onChange={(e) => setDeaths(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-8">
                        <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                            <span className="w-7 h-7 rounded bg-medical-green-900 text-white flex items-center justify-center font-black text-[10px]">03</span>
                            <h2 className="text-[12px] font-black text-medical-green-900 uppercase tracking-widest">ระดับความรุนแรงและพิกัด</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-4 text-left">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Status Classification</label>
                                <div className="grid grid-cols-1 gap-4">
                                    {[
                                        { id: 'normal', label: 'ปกติ (Normal)', color: 'bg-medical-green-500', active: 'border-medical-green-600 bg-medical-green-50' },
                                        { id: 'watch', label: 'เฝ้าระวัง (Watch)', color: 'bg-amber-500', active: 'border-amber-500 bg-amber-50' },
                                        { id: 'emergency', label: 'ฉุกเฉิน (Emergency)', color: 'bg-rose-500', active: 'border-rose-500 bg-rose-50' }
                                    ].map((s) => (
                                        <label key={s.id} className="relative cursor-pointer">
                                            <input type="radio" name="sev" value={s.id} checked={severity === s.id} onChange={(e) => setSeverity(e.target.value)} className="hidden" />
                                            <div className={`flex items-center gap-4 px-6 py-4 rounded border transition-all ${severity === s.id ? s.active : 'bg-white border-slate-100 hover:border-slate-200'}`}>
                                                <div className={`w-2.5 h-2.5 rounded-full ${s.color} ${severity === s.id ? 'animate-pulse' : ''}`} />
                                                <span className="text-sm font-black text-slate-800 uppercase tracking-widest">{s.label}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Precision GPS Tracking</label>
                                    <div className="bg-slate-50 border border-slate-100 rounded-md p-6 space-y-4">
                                        <div className="flex items-center gap-4 text-left">
                                            <div className="w-8 h-8 rounded bg-white flex items-center justify-center border border-slate-200 text-medical-green-900">
                                                <MapPin className="w-4 h-4" />
                                            </div>
                                            <p className="font-mono text-[11px] text-slate-500 font-bold leading-relaxed">{coords}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={getGPS}
                                            className="w-full py-3 bg-white border border-slate-200 rounded text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:text-medical-green-700 hover:border-medical-green-200 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Activity className="w-3.5 h-3.5" />
                                            Detect Current Location
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Clinical Remarks</label>
                                    <textarea
                                        placeholder="Add specific clinical notes or environmental observations..."
                                        className="w-full bg-slate-50 border border-slate-100 rounded py-4 px-6 font-bold text-sm text-slate-700 outline-none focus:border-medical-green-600 transition-all min-h-[140px]"
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-10 flex flex-col sm:flex-row items-center justify-between gap-8 border-t border-slate-50">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
                            <ShieldCheck className="w-4 h-4 text-medical-green-500" />
                            Data Encryption Enabled
                        </div>
                        <div className="flex gap-4">
                            <button type="button" className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all">
                                Clear Form
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitted}
                                className={`px-12 py-5 rounded text-[12px] font-black uppercase tracking-[0.2em] flex items-center gap-4 transition-all ${isSubmitted
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                                    : 'bg-medical-green-900 text-white shadow-xl shadow-emerald-900/10 hover:bg-medical-green-800'
                                    }`}
                            >
                                {isSubmitted ? 'Processing...' : (
                                    <>
                                        Authorize & Submit
                                        <Send className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>

                <div className="bg-medical-green-900 px-10 py-5 flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em] text-medical-green-200/40">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-medical-green-400 animate-pulse" />
                        Surveillance Node v2.0
                    </div>
                    <span>Authorized Personnel Only</span>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in text-left">
                    <div className="bg-white rounded-md shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
                        <div className="bg-medical-green-900 p-8 flex items-center gap-5">
                            <div className="w-12 h-12 bg-white/10 rounded flex items-center justify-center text-white border border-white/20">
                                <Hospital className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-white font-black text-xl uppercase tracking-tight">ตั้งค่าหน่วยงาน</h3>
                                <p className="text-medical-green-200/50 text-[10px] font-black uppercase tracking-widest">Network Identity Profile</p>
                            </div>
                        </div>

                        <div className="p-8 space-y-8">
                            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest leading-relaxed">
                                กรมควบคุมโรคต้องการข้อมูลยืนยันตนของสถานพยาบาลสำหรับการส่งรายงานทางอิเล็กทรอนิกส์
                            </p>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Facility Code *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 0XXXX"
                                        className="w-full bg-slate-50 border border-slate-100 rounded py-3.5 px-6 font-bold text-sm text-slate-700 outline-none focus:border-medical-green-600 transition-all font-mono"
                                        value={modalCode}
                                        onChange={(e) => setModalCode(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Official Name *</label>
                                    <input
                                        type="text"
                                        placeholder="Hospital or Health Center Name..."
                                        className="w-full bg-slate-50 border border-slate-100 rounded py-3.5 px-6 font-bold text-sm text-slate-700 outline-none focus:border-medical-green-600 transition-all"
                                        value={modalName}
                                        onChange={(e) => setModalName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Service Region</label>
                                    <div className="relative">
                                        <select
                                            className="w-full appearance-none bg-slate-50 border border-slate-100 rounded py-3.5 px-6 text-sm font-bold text-slate-700 outline-none focus:border-medical-green-600 transition-all cursor-pointer"
                                            value={modalProvince}
                                            onChange={(e) => setModalProvince(e.target.value)}
                                        >
                                            <option value="">Select Region...</option>
                                            <option>กรุงเทพมหานคร</option>
                                            <option>เชียงใหม่</option>
                                            <option>ขอนแก่น</option>
                                            <option>สงขลา</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-6">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-all"
                            >
                                Skip Setup
                            </button>
                            <button
                                type="button"
                                onClick={saveFacility}
                                className="bg-medical-green-900 text-white px-10 py-4 rounded text-[11px] font-black uppercase tracking-widest shadow-xl shadow-emerald-900/10 hover:bg-medical-green-800 transition-all flex items-center gap-2"
                            >
                                <ShieldCheck className="w-4 h-4" />
                                Save & Verify
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
