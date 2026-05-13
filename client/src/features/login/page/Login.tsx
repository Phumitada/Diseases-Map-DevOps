import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../stores/authStore';
import apiClient from '../../../api/apiClient';
import { ShieldAlert, Eye, EyeOff, Phone, Mail, Clock } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/auth/', { username, password });
      const { token, payload } = response.data;
      login(token, payload);
      navigate('/map');
    } catch (err: any) {
      setError(err.response?.data?.message || 'เข้าสู่ระบบไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-light-bg bg-pattern">
      <div className="bg-medical-green-900 text-white/90 py-2 px-8 border-b border-white/5 hidden md:block">
        <div className="max-w-[1400px] mx-auto flex justify-between items-center text-[11px] font-bold tracking-wider uppercase">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-medical-green-100" />
              <span>สายด่วน: 1422 (24 ชั่วโมง)</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-medical-green-100" />
              <span>info@ddc.mail.go.th</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 border-r border-white/10 pr-6">
              <Clock className="w-3.5 h-3.5 text-medical-green-100" />
              <span>จันทร์ – ศุกร์: 08:30 – 16:30</span>
            </div>
            <div className="flex items-center gap-4">
              <button className="hover:text-white transition-colors">ภาษา: ไทย</button>
              <button className="hover:text-white transition-colors">EN</button>
            </div>
          </div>
        </div>
      </div>
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-200/60 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center gap-4" onClick={() => navigate('/')}>
          <div className="w-12 h-12 rounded-lg bg-medical-green-900 text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-105">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div className="flex flex-col">
            <span className="text-[16px] font-black leading-tight uppercase tracking-tight text-slate-900">
              National Health Portal
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-medical-green-600 mt-0.5">
              กรมควบคุมโรค • ประเทศไทย
            </span>
          </div>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="backdrop-blur-md bg-white/80 border border-slate-200/60 rounded-2xl shadow-card p-8 md:p-10">
            <div className="flex flex-col items-center mb-8">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-medical-green-700 text-white flex items-center justify-center shadow-primary mb-4">
                <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>login</span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 mb-1">เข้าสู่ระบบ</h1>
              <p className="text-sm text-slate-500">สำหรับโรงพยาบาลเครือข่ายกรมควบคุมโรค</p>
            </div>
            {error && (
              <div className="mb-5 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  รหัสโรงพยาบาล (Username)
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: '20px' }}>
                    local_hospital
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="กรอกรหัสโรงพยาบาล"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  รหัสผ่าน (Password)
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: '20px' }}>
                    lock
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="กรอกรหัสผ่าน"
                    className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-slate-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-primary to-medical-green-600 text-white font-bold rounded-lg shadow-primary hover:from-primary-dark hover:to-medical-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    กำลังเข้าสู่ระบบ...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>login</span>
                    เข้าสู่ระบบ
                  </>
                )}
              </button>
            </form>

          </div>
        </div>
      </main>
      <footer className="bg-medical-green-900 text-white/70 py-4">
        <div className="max-w-[1400px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-2 text-xs font-medium">
          <p>© 2026 กองระบาดวิทยา กรมควบคุมโรค กระทรวงสาธารณสุข</p>
          <p>สงวนลิขสิทธิ์ทุกประการ</p>
        </div>
      </footer>
    </div>
  );
}