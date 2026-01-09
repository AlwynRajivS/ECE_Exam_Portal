
import React, { useState, useEffect } from 'react';
import { UserRole, AuthState } from './types';
import Header from './components/Header';
import AdminDashboard from './components/AdminDashboard';
import ExamPortal from './components/ExamPortal';
import StudentDashboard from './components/StudentDashboard';
import Login from './components/Login';
import { API_ENABLED, GAS_URL } from './config';

const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthState>({ role: null, user: null });
  const [isViolationActive, setIsViolationActive] = useState(false);
  const [violationMsg, setViolationMsg] = useState("");
  const [activeExamId, setActiveExamId] = useState<string | null>(null);

  useEffect(() => {
    if (auth.role === UserRole.STUDENT && activeExamId) {
      const preventDefault = (e: Event) => e.preventDefault();
      document.addEventListener('contextmenu', preventDefault);
      document.addEventListener('selectstart', preventDefault);
      document.addEventListener('copy', preventDefault);
      document.addEventListener('paste', preventDefault);
      document.addEventListener('cut', preventDefault);

      const handleKeyDown = (e: KeyboardEvent) => {
        const forbiddenKeys = ['c', 'v', 'x', 'u', 'i', 'j', 's', 'p', 'a'];
        const isCtrlOrMeta = e.ctrlKey || e.metaKey;
        if (e.key === 'F12' || (isCtrlOrMeta && forbiddenKeys.includes(e.key.toLowerCase()))) {
          e.preventDefault();
          triggerInternalViolation('Unauthorized Keyboard Input');
        }
      };
      
      const handleVisibilityChange = () => {
        if (document.hidden) triggerInternalViolation('Tab/Window Switched');
      };

      const handleWindowBlur = () => {
        triggerInternalViolation('Application Focus Lost');
      };

      const triggerInternalViolation = (msg: string) => {
        setViolationMsg(msg);
        setIsViolationActive(true);
        window.dispatchEvent(new CustomEvent('exam-violation', { detail: msg }));
      };

      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('blur', handleWindowBlur);

      return () => {
        document.removeEventListener('contextmenu', preventDefault);
        document.removeEventListener('selectstart', preventDefault);
        document.removeEventListener('copy', preventDefault);
        document.removeEventListener('paste', preventDefault);
        document.removeEventListener('cut', preventDefault);
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('blur', handleWindowBlur);
      };
    }
  }, [auth.role, activeExamId]);

  const handleLogin = (role: UserRole, user: any) => setAuth({ role, user });
  const handleLogout = () => {
    setAuth({ role: null, user: null });
    setIsViolationActive(false);
    setActiveExamId(null);
  };

  return (
    <div className="min-h-screen flex flex-col transition-all duration-300">
      <Header auth={auth} onLogout={handleLogout} />
      
      <main className="flex-1 p-4 md:p-8">
        {!auth.role ? (
          <Login onLogin={handleLogin} />
        ) : auth.role === UserRole.ADMIN ? (
          <AdminDashboard />
        ) : activeExamId ? (
          <ExamPortal 
            student={auth.user} 
            examId={activeExamId}
            onFinish={() => setActiveExamId(null)} 
          />
        ) : (
          <StudentDashboard 
            student={auth.user} 
            onStartExam={(id) => setActiveExamId(id)} 
          />
        )}
      </main>

      {isViolationActive && auth.role === UserRole.STUDENT && activeExamId && (
        <div className="fixed inset-0 bg-red-950/98 z-[999] flex flex-col items-center justify-center text-white p-8 backdrop-blur-3xl animate-in fade-in duration-300">
          <div className="w-24 h-24 bg-white/10 rounded-[2.5rem] flex items-center justify-center text-5xl mb-10 border border-white/20 animate-pulse">
            <i className="fas fa-shield-exclamation text-red-500"></i>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-6 text-center tracking-tighter uppercase">{violationMsg}</h1>
          <p className="text-xl text-center max-w-xl opacity-70 mb-12 font-medium leading-relaxed">
            SECURITY PROTOCOL: Any deviation from the secure browser window is recorded as an institutional violation.
          </p>
          <button 
            onClick={() => setIsViolationActive(false)}
            className="bg-white text-red-900 px-16 py-6 rounded-[2rem] font-black shadow-2xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-sm"
          >
            ACKNOWLEDGE STRIKE & RETURN
          </button>
        </div>
      )}

      {API_ENABLED && (
        <div className="fixed bottom-4 right-4 bg-emerald-500 text-white px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg animate-pulse z-50">
          Sync Connected to Cloud
        </div>
      )}
    </div>
  );
};

export default App;
