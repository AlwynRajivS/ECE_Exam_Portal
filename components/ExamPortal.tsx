
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Question, QuestionPart, Student, ExamSettings, Violation } from '../types';
import { API_ENABLED, GAS_URL } from '../config';

interface ExamPortalProps {
  student: Student;
  examId: string;
  onFinish: () => void;
}

const ScientificCalculator: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [display, setDisplay] = useState('0');
  const buttons = ['7','8','9','/','sin','cos','4','5','6','*','tan','log','1','2','3','-','exp','sqrt','0','.','=','+','C','(',')'];
  
  const handleCalc = (btn: string) => {
    if (btn === 'C') setDisplay('0');
    else if (btn === '=') {
      try {
        let sanitized = display
          .replace(/sin/g, 'Math.sin')
          .replace(/cos/g, 'Math.cos')
          .replace(/tan/g, 'Math.tan')
          .replace(/log/g, 'Math.log10')
          .replace(/sqrt/g, 'Math.sqrt')
          .replace(/exp/g, 'Math.exp');
        if (/[^0-9+\-*/.()Mathsin|cos|tan|log|sqrt|exp]/.test(sanitized)) throw new Error();
        setDisplay(String(eval(sanitized)));
      } catch { setDisplay('Error'); }
    } else setDisplay(prev => prev === '0' ? btn : prev + btn);
  };

  return (
    <div className="fixed top-20 right-8 z-[100] bg-slate-900 p-6 rounded-[2rem] shadow-2xl border border-white/10 w-72 animate-in zoom-in-95">
      <div className="flex justify-between items-center mb-4">
        <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Scientific Tool</span>
        <button onClick={onClose} className="text-slate-500 hover:text-white"><i className="fas fa-times"></i></button>
      </div>
      <div className="bg-black/50 p-4 rounded-xl mb-4 text-right overflow-hidden border border-white/5">
        <span className="text-white font-mono text-xl block truncate">{display}</span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {buttons.map(b => (
          <button key={b} onClick={() => handleCalc(b)} className={`p-2 text-[10px] font-black rounded-lg transition-all ${b === '=' ? 'bg-indigo-600 text-white col-span-2' : b === 'C' ? 'bg-red-950 text-red-500' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}>
            {b}
          </button>
        ))}
      </div>
    </div>
  );
};

const MathText: React.FC<{ text: string }> = ({ text }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (containerRef.current && (window as any).renderMathInElement) {
      try {
        (window as any).renderMathInElement(containerRef.current, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false },
          ],
          throwOnError: false,
        });
      } catch (e) { console.warn("KaTeX Error", e); }
    }
  }, [text]);
  return <div ref={containerRef} className="math-container" dangerouslySetInnerHTML={{ __html: text }} />;
};

const ExamPortal: React.FC<ExamPortalProps> = ({ student, examId, onFinish }) => {
  const [phase, setPhase] = useState<'exam' | 'review' | 'submitting'>('exam');
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCalc, setShowCalc] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [settings, setSettings] = useState<ExamSettings>({
    examId: examId,
    totalTimeMinutes: 40,
    maxViolations: 3,
    partACount: 10,
    partBCount: 5,
    isReviewEnabled: true,
    isReleased: false,
    isCalculatorEnabled: true
  });

  useEffect(() => {
    const fetchData = async () => {
      if (API_ENABLED) {
        try {
          const response = await fetch(`${GAS_URL}?action=getQuestions&examId=${examId}`);
          const data = await response.json();
          if (data && data.length > 0) {
            setActiveQuestions(data.map((q: any) => ({
              ...q,
              options: JSON.parse(q.options),
              correctAnswer: parseInt(q.correctAnswer)
            })));
          }
        } catch (e) { console.error("API Fetch Failed", e); }
      }
      
      // Fallback or Mock
      if (!API_ENABLED || activeQuestions.length === 0) {
        const mockBank: Question[] = Array.from({ length: 15 }).map((_, i) => ({
          id: `q-${i}-${Math.random().toString(36).substr(2, 5)}`,
          examId,
          text: i % 4 === 0 
            ? `Solve for $x$: $\\int_0^x 2t \\, dt = 16$` 
            : `What is the institutional protocol for secure sessions?`,
          options: ['4', 'Protocol A', 'Institutional Lock', 'Data Sync'],
          correctAnswer: 0,
          part: i < 10 ? QuestionPart.A : QuestionPart.B,
          imageUrl: i === 4 ? `https://picsum.photos/600/300?grayscale&random=${i}` : undefined
        }));
        setActiveQuestions(mockBank);
      }
      setTimeLeft(settings.totalTimeMinutes * 60);
      setIsLoading(false);
    };

    fetchData();
  }, [examId, settings.totalTimeMinutes]);

  const triggerViolation = useCallback((type: string) => {
    const v: Violation = { type, timestamp: new Date().toLocaleTimeString() };
    setViolations(prev => {
      const next = [...prev, v];
      if (next.length >= settings.maxViolations) {
        handleSubmit(true);
      }
      return next;
    });
  }, [settings.maxViolations]);

  const handleSubmit = useCallback(async (isAuto = false) => {
    setPhase('submitting');
    if (timerRef.current) clearInterval(timerRef.current);
    
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen().catch(() => {});
      }
    } catch (e) {}

    if (API_ENABLED) {
      try {
        await fetch(GAS_URL, {
          method: 'POST',
          mode: 'no-cors',
          body: JSON.stringify({
            action: 'submitExam',
            rollNo: student.rollNo,
            examId,
            score: 0, // In real logic, calculate score on backend or here
            violations: violations.length,
            answers
          })
        });
      } catch (e) {}
    }
    
    setTimeout(() => onFinish(), 2000);
  }, [onFinish, student.rollNo, examId, violations.length, answers]);

  useEffect(() => {
    const onViolation = (e: any) => triggerViolation(e.detail);
    window.addEventListener('exam-violation', onViolation);
    
    const onFSChange = () => {
       if (!document.fullscreenElement && phase === 'exam') {
          triggerViolation('Full-screen Breach');
       }
    };
    document.addEventListener('fullscreenchange', onFSChange);

    timerRef.current = setInterval(() => {
      setTimeLeft(t => { if (t <= 0) { handleSubmit(true); return 0; } return t - 1; });
    }, 1000);

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(s => { 
          if (videoRef.current) videoRef.current.srcObject = s; 
          setCameraError(false);
        })
        .catch(() => setCameraError(true));
    }

    return () => {
      window.removeEventListener('exam-violation', onViolation);
      document.removeEventListener('fullscreenchange', onFSChange);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [triggerViolation, handleSubmit, phase]);

  if (isLoading || activeQuestions.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
        <div className="w-16 h-16 border-4 border-indigo-600/10 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Preparing Secure Channel...</p>
      </div>
    );
  }

  const q = activeQuestions[currentIdx];

  return (
    <div className="max-w-7xl mx-auto pb-32 px-4 md:px-0 animate-in fade-in duration-700">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-xl shadow-inner"><i className="fas fa-hourglass-half"></i></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase">Timer</p>
            <p className={`text-2xl font-black font-mono ${timeLeft < 300 ? 'text-red-600 animate-pulse' : 'text-slate-800'}`}>
              {Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}
            </p>
          </div>
        </div>
        <div className={`p-6 rounded-[2.5rem] border shadow-sm flex items-center gap-4 transition-all ${violations.length > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'}`}>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner ${violations.length > 0 ? 'bg-red-600 text-white animate-bounce' : 'bg-slate-100 text-slate-400'}`}><i className="fas fa-shield-virus"></i></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase">Strikes</p>
            <p className={`text-2xl font-black ${violations.length >= settings.maxViolations - 1 ? 'text-red-600' : 'text-slate-800'}`}>{violations.length}/{settings.maxViolations}</p>
          </div>
        </div>
        <div className="hidden md:flex col-span-2 bg-black rounded-[2.5rem] overflow-hidden relative border-4 border-white shadow-xl h-24">
           {cameraError ? (
             <div className="w-full h-full flex items-center justify-center bg-slate-900 text-[10px] text-white/40 font-black uppercase tracking-widest gap-3">
               <i className="fas fa-video-slash"></i> Proctoring Camera Blocked
             </div>
           ) : (
             <>
               <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover grayscale opacity-50 blur-[1px]" />
               <div className="absolute top-3 left-6 flex items-center gap-2 bg-black/60 px-4 py-1.5 rounded-full border border-white/20 backdrop-blur-md">
                 <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                 <span className="text-[8px] font-black text-white uppercase tracking-widest">Surveillance Live</span>
               </div>
             </>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-3">
          <div className="bg-white p-8 md:p-16 rounded-[4rem] border border-slate-200 shadow-2xl relative overflow-hidden min-h-[600px] flex flex-col">
            <div className="absolute top-0 left-0 w-full h-2 bg-slate-50">
              <div className="h-full bg-indigo-600 transition-all duration-700 ease-out" style={{ width: `${((currentIdx + 1) / activeQuestions.length) * 100}%` }}></div>
            </div>

            <div className="flex justify-between items-center mb-12">
               <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${q.part === QuestionPart.A ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'}`}>
                 {q.part === QuestionPart.A ? 'Section A • 1 Mark' : 'Section B • 2 Marks'}
               </span>
               <div className="flex items-center gap-6">
                 {settings.isCalculatorEnabled && (
                   <button onClick={() => setShowCalc(!showCalc)} className={`w-10 h-10 rounded-xl transition-all shadow-sm ${showCalc ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>
                     <i className="fas fa-calculator"></i>
                   </button>
                 )}
                 <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Item {currentIdx + 1} / {activeQuestions.length}</span>
               </div>
            </div>

            <div className="flex-1">
              <div className="text-2xl md:text-4xl font-bold text-slate-800 mb-12 leading-tight tracking-tight">
                <MathText text={q.text} />
              </div>
              {q.imageUrl && (
                <div className="mb-12 rounded-[3rem] bg-slate-50 border border-slate-100 p-10 flex justify-center shadow-inner overflow-hidden">
                   <img src={q.imageUrl} className="max-h-96 object-contain rounded-2xl shadow-2xl" alt="Asset" />
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {q.options.map((opt, i) => (
                  <button 
                    key={i}
                    onClick={() => setAnswers({...answers, [q.id]: i})}
                    className={`group p-8 text-left rounded-[2.5rem] border-2 transition-all flex items-center gap-6 ${answers[q.id] === i ? 'bg-indigo-50 border-indigo-600 text-indigo-800 ring-[12px] ring-indigo-500/5 shadow-inner' : 'border-slate-50 hover:border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl ${answers[q.id] === i ? 'bg-indigo-600 text-white shadow-xl rotate-3' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200 transition-transform'}`}>
                      {String.fromCharCode(65 + i)}
                    </div>
                    <span className="font-bold text-lg md:text-xl flex-1"><MathText text={opt} /></span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-16 pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
              <button disabled={currentIdx === 0} onClick={() => setCurrentIdx(prev => prev - 1)} className="px-10 py-5 font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-indigo-600 disabled:opacity-20 transition-all">
                <i className="fas fa-arrow-left mr-2"></i> Prev
              </button>
              <button onClick={() => setMarkedForReview(prev => {
                const next = new Set(prev);
                if (next.has(q.id)) next.delete(q.id); else next.add(q.id);
                return next;
              })} className={`px-12 py-5 rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all border-2 ${markedForReview.has(q.id) ? 'bg-orange-50 border-orange-500 text-orange-600 shadow-lg' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}>
                {markedForReview.has(q.id) ? 'Flag Set' : 'Flag Item'}
              </button>
              <button onClick={() => currentIdx === activeQuestions.length - 1 ? setPhase('review') : setCurrentIdx(prev => prev + 1)} className="bg-slate-900 text-white px-12 md:px-20 py-7 rounded-[2.5rem] font-black text-[10px] hover:bg-black transition-all uppercase tracking-widest shadow-2xl">
                {currentIdx === activeQuestions.length - 1 ? 'Final Review' : 'Next Item'}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[3.5rem] border border-slate-200 shadow-xl">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 border-b border-slate-50 pb-5">Navigator</h4>
             <div className="grid grid-cols-5 gap-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                {activeQuestions.map((ques, idx) => {
                  const isAns = answers[ques.id] !== undefined;
                  const isMark = markedForReview.has(ques.id);
                  const isCurr = currentIdx === idx;
                  return (
                    <button key={idx} onClick={() => setCurrentIdx(idx)} className={`aspect-square rounded-xl text-[10px] font-black border-2 transition-all ${isCurr ? 'bg-indigo-600 text-white border-indigo-700 scale-110 shadow-lg z-10' : isMark ? 'bg-orange-500 text-white border-orange-600' : isAns ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-slate-50 text-slate-300 border-slate-100 hover:bg-slate-100'}`}>
                      {idx + 1}
                    </button>
                  );
                })}
             </div>
          </div>
          <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-xl"></div>
             <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-4">Identity Secured</p>
             <p className="text-sm font-black mb-1">{student.name}</p>
             <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{student.rollNo}</p>
          </div>
          <div className="bg-white p-8 rounded-[3.5rem] border border-slate-200 shadow-sm">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Security Events</h4>
             <div className="space-y-4 max-h-[200px] overflow-y-auto custom-scrollbar text-[9px] font-bold">
               {violations.length === 0 ? <p className="text-slate-300 italic py-4 text-center">No breaches detected.</p> : violations.map((v, i) => (
                 <div key={i} className="text-red-600 bg-red-50/40 p-4 rounded-[1.5rem] border border-red-50 flex justify-between items-center">
                   <span>{v.type}</span>
                   <span className="opacity-40">{v.timestamp}</span>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>

      {showCalc && <ScientificCalculator onClose={() => setShowCalc(false)} />}

      {phase === 'review' && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/98 backdrop-blur-3xl animate-in fade-in duration-500">
          <div className="bg-white w-full max-w-2xl rounded-[4rem] p-12 md:p-20 shadow-2xl relative overflow-hidden">
             <h2 className="text-4xl font-black text-slate-800 mb-6 uppercase tracking-tighter">Institutional Summary</h2>
             <div className="grid grid-cols-3 gap-6 mb-12">
                <div className="bg-emerald-50 p-8 rounded-[3rem] text-center">
                  <p className="text-[10px] font-black text-emerald-600 uppercase mb-2">Done</p>
                  <p className="text-5xl font-black text-emerald-900">{Object.keys(answers).length}</p>
                </div>
                <div className="bg-orange-50 p-8 rounded-[3rem] text-center">
                  <p className="text-[10px] font-black text-orange-600 uppercase mb-2">Flags</p>
                  <p className="text-5xl font-black text-orange-900">{markedForReview.size}</p>
                </div>
                <div className="bg-red-50 p-8 rounded-[3rem] text-center">
                  <p className="text-[10px] font-black text-red-600 uppercase mb-2">Strikes</p>
                  <p className="text-5xl font-black text-red-600">{violations.length}</p>
                </div>
             </div>
             <button onClick={() => handleSubmit(false)} className="w-full bg-slate-900 text-white font-black py-8 rounded-[3rem] hover:bg-black transition-all shadow-2xl text-[11px] uppercase tracking-widest mb-6">SUBMIT SESSION LOG</button>
             <button onClick={() => setPhase('exam')} className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600">Return to assessment</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamPortal;
