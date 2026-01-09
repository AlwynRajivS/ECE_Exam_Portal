
import React, { useState, useEffect } from 'react';
import { UserRole, StudentResult } from '../types';

interface LoginProps {
  onLogin: (role: UserRole, user: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [tab, setTab] = useState<'student' | 'admin'>('student');
  const [rollNo, setRollNo] = useState('');
  const [password, setPassword] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Mock results list to simulate status checking
  // In production, this would be a GAS fetch: fetch(GAS_URL + '?action=getResults')
  const [mockResults, setMockResults] = useState<StudentResult[]>([
    { rollNo: '21BCS012', name: 'Bala J', dept: 'CSE', year: 'III', section: 'A', examId: 'SEM-APR-2024', score: 0, violations: 3, violationLog: [], submittedAt: '2024-04-12 10:45', answers: {}, status: 'TERMINATED' },
  ]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsChecking(true);

    // Simulation delay for security verification
    setTimeout(() => {
      if (tab === 'admin') {
        if (password === 'admin123') {
          onLogin(UserRole.ADMIN, { name: 'Institutional COE' });
        } else {
          setErrorMsg('INVALID INSTITUTIONAL KEY');
        }
      } else {
        const studentId = rollNo.trim().toUpperCase();
        if (studentId) {
          // Check if student is terminated
          const prevResult = mockResults.find(r => r.rollNo === studentId && r.examId === 'SEM-APR-2024');
          
          if (prevResult?.status === 'TERMINATED') {
            setErrorMsg('SESSION TERMINATED: Multiple security violations recorded. Access blocked. Contact COE Central.');
          } else if (prevResult?.status === 'SUBMITTED') {
            setErrorMsg('ALREADY SUBMITTED: Attempt recorded for this session.');
          } else {
            onLogin(UserRole.STUDENT, { 
              rollNo: studentId, 
              name: 'Candidate ' + studentId,
              department: 'Eng. & Tech.',
              year: 'III',
              section: 'A',
              examId: 'SEM-APR-2024'
            });
          }
        } else {
          setErrorMsg('ENTER REGISTRATION NUMBER');
        }
      }
      setIsChecking(false);
    }, 1200);
  };

  return (
    <div className="max-w-md mx-auto mt-6 md:mt-16">
      <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in slide-in-from-bottom-10 duration-700">
        <div className="flex border-b border-slate-100">
          <button 
            className={`flex-1 py-6 font-black text-[10px] tracking-[0.2em] transition-all ${tab === 'student' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30' : 'text-slate-400 hover:text-slate-600'}`}
            onClick={() => {setTab('student'); setErrorMsg(null);}}
          >
            STUDENT PORTAL
          </button>
          <button 
            className={`flex-1 py-6 font-black text-[10px] tracking-[0.2em] transition-all ${tab === 'admin' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30' : 'text-slate-400 hover:text-slate-600'}`}
            onClick={() => {setTab('admin'); setErrorMsg(null);}}
          >
            COE CONTROL
          </button>
        </div>

        <div className="p-10 md:p-14">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Authentication</h2>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2">KCET Institutional Verification System</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                {tab === 'student' ? 'Registration ID' : 'Institutional Admin ID'}
              </label>
              <div className="relative group">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <i className={`fas ${tab === 'student' ? 'fa-fingerprint' : 'fa-user-shield'}`}></i>
                </span>
                <input 
                  type="text" 
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  disabled={isChecking}
                  className="w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] py-5 pl-16 pr-6 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-black text-slate-800 uppercase"
                  placeholder={tab === 'student' ? "e.g. 21BCS042" : "Institutional ID"}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                Security Key
              </label>
              <div className="relative group">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <i className="fas fa-key"></i>
                </span>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isChecking}
                  className="w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] py-5 pl-16 pr-6 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-black"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="bg-red-50 p-5 rounded-2xl border border-red-100 animate-in shake duration-500">
                <p className="text-[10px] font-black text-red-600 leading-relaxed uppercase tracking-tight">
                  <i className="fas fa-triangle-exclamation mr-2"></i> {errorMsg}
                </p>
              </div>
            )}

            <button 
              type="submit"
              disabled={isChecking}
              className="w-full bg-slate-900 text-white font-black py-6 rounded-[1.5rem] shadow-2xl hover:bg-black active:scale-95 transition-all text-[11px] tracking-[0.2em] uppercase flex items-center justify-center gap-4 group"
            >
              {isChecking ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Verify Credentials
                  <i className="fas fa-chevron-right text-[8px] group-hover:translate-x-2 transition-transform"></i>
                </>
              )}
            </button>
          </form>

          <div className="mt-12 flex items-center justify-center gap-4 opacity-30 grayscale">
             <div className="h-[1px] bg-slate-300 flex-1"></div>
             <i className="fas fa-shield-halved text-xs"></i>
             <div className="h-[1px] bg-slate-300 flex-1"></div>
          </div>
          <p className="text-center text-[8px] text-slate-400 mt-6 font-black uppercase tracking-[0.3em]">
            Institutional Control Unit • 2024
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
