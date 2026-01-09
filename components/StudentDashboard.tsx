
import React, { useState } from 'react';
import { Student, StudentResult, QuestionPart } from '../types';

interface StudentDashboardProps {
  student: Student;
  onStartExam: (examId: string) => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ student, onStartExam }) => {
  const [reviewExam, setReviewExam] = useState<StudentResult | null>(null);

  const assignedExams = [
    { id: 'SEM-APR-2024', title: 'Calculus III', duration: '60m', marks: '50', status: 'LIVE' },
    { id: 'OS-MAY-2024', title: 'Operating Systems', duration: '45m', marks: '30', status: 'LOCKED' }
  ];

  const pastResults: StudentResult[] = [
    {
      rollNo: student.rollNo,
      name: student.name,
      dept: student.department,
      year: student.year,
      section: student.section,
      examId: 'UNIT-TEST-1',
      score: 18,
      violations: 1,
      violationLog: [],
      submittedAt: '2024-03-10 14:20',
      answers: { 'q-0': 0, 'q-1': 1 },
      status: 'SUBMITTED',
      isReleased: false
    }
  ];

  const handleStartExam = async (examId: string) => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen().catch(err => {
          console.warn("Fullscreen request blocked or failed", err);
        });
      }
    } catch (e) {}
    onStartExam(examId);
  };

  if (reviewExam) {
    return (
      <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-10 duration-500 pb-20">
        <button onClick={() => setReviewExam(null)} className="mb-8 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 flex items-center gap-3">
          <i className="fas fa-arrow-left"></i> Dashboard
        </button>
        <div className="bg-white rounded-[4rem] p-12 md:p-16 shadow-2xl border border-slate-100">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
            <div>
              <h2 className="text-4xl font-black text-slate-800 uppercase tracking-tighter mb-2">Performance Insight</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{reviewExam.examId}</p>
            </div>
            {!reviewExam.isReleased && (
              <div className="bg-red-50 text-red-600 px-8 py-4 rounded-[2rem] border border-red-100 flex items-center gap-4">
                <i className="fas fa-lock text-sm"></i>
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Results Embargo</p>
                  <p className="text-[8px] font-bold opacity-60 uppercase">Locked by COE</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 flex flex-col justify-center">
              <p className="text-[8px] font-black text-slate-400 uppercase mb-2">Status</p>
              <p className="text-xl font-black text-indigo-600">{reviewExam.status}</p>
            </div>
            <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 flex flex-col justify-center">
              <p className="text-[8px] font-black text-slate-400 uppercase mb-2">Mark</p>
              <p className="text-4xl font-black text-slate-800 tracking-tighter">{reviewExam.isReleased ? reviewExam.score : '—'}</p>
            </div>
            <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 flex flex-col justify-center">
              <p className="text-[8px] font-black text-slate-400 uppercase mb-2">Strikes</p>
              <p className={`text-4xl font-black ${reviewExam.violations > 0 ? 'text-red-500' : 'text-emerald-500'}`}>{reviewExam.violations}</p>
            </div>
            <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 flex flex-col justify-center">
              <p className="text-[8px] font-black text-slate-400 uppercase mb-2">Date</p>
              <p className="text-xs font-black text-slate-800 mt-1">{new Date(reviewExam.submittedAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="space-y-8">
            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-4">
              <div className="w-1.5 h-8 bg-indigo-600 rounded-full"></div> Response Validation
            </h3>
            {reviewExam.isReleased ? (
              <div className="p-10 bg-emerald-50 rounded-[3rem] border border-emerald-100">
                <p className="text-lg font-bold text-slate-800 leading-relaxed mb-6">Question mapping analysis enabled.</p>
                <div className="flex flex-wrap gap-4">
                  <span className="text-[10px] font-black bg-white px-5 py-2 rounded-2xl text-emerald-600 uppercase border border-emerald-100">COE: Option A</span>
                  <span className="text-[10px] font-black bg-emerald-500 px-5 py-2 rounded-2xl text-white uppercase">Candidate: Option A</span>
                </div>
              </div>
            ) : (
              <div className="p-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                 <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300 text-3xl shadow-sm">
                   <i className="fas fa-shield-halved"></i>
                 </div>
                 <h4 className="text-xl font-black text-slate-800 uppercase mb-3">Integrity Mask Active</h4>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-loose max-w-sm mx-auto">
                   Answer key is restricted until session authorization.
                 </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div className="bg-white p-10 md:p-14 rounded-[4rem] shadow-2xl border border-slate-100 flex flex-col md:flex-row justify-between items-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-50 rounded-full -mr-40 -mt-40 blur-[100px] opacity-60"></div>
        <div className="flex items-center gap-10 relative z-10">
          <div className="w-24 h-24 bg-slate-900 rounded-[2.5rem] flex items-center justify-center text-white text-4xl shadow-2xl rotate-3">
            <i className="fas fa-user-shield"></i>
          </div>
          <div>
            <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none mb-3">{student.name}</h2>
            <div className="flex gap-3">
              <span className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{student.rollNo}</span>
              <span className="bg-slate-50 text-slate-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-100">Verified Identity</span>
            </div>
          </div>
        </div>
        <div className="mt-10 md:mt-0 flex flex-col items-end gap-2 relative z-10">
           <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">Institutional Mapping</p>
           <div className="bg-slate-50 px-8 py-5 rounded-[2rem] border border-slate-100 text-right">
             <p className="text-sm font-black text-slate-800 uppercase">{student.department}</p>
             <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Year {student.year} • Section {student.section}</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-5">
            <div className="w-2 h-10 bg-indigo-600 rounded-full"></div> Assigned Assessments
          </h3>
          <div className="space-y-6">
            {assignedExams.map(exam => (
              <div key={exam.id} className="bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all group">
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <h4 className="text-2xl font-black text-slate-800 uppercase group-hover:text-indigo-600 transition-colors tracking-tight">{exam.title}</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">{exam.id}</p>
                  </div>
                  <span className={`px-5 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-lg ${exam.status === 'LIVE' ? 'bg-emerald-500 text-white shadow-emerald-100 animate-pulse' : 'bg-slate-100 text-slate-400 shadow-none'}`}>
                    {exam.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-6 mb-10">
                   <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                      <p className="text-[8px] font-black text-slate-400 uppercase mb-2">Time</p>
                      <p className="text-lg font-black text-slate-800">{exam.duration}</p>
                   </div>
                   <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                      <p className="text-[8px] font-black text-slate-400 uppercase mb-2">Max Marks</p>
                      <p className="text-lg font-black text-slate-800">{exam.marks} Marks</p>
                   </div>
                </div>
                <button 
                  disabled={exam.status !== 'LIVE'}
                  onClick={() => handleStartExam(exam.id)}
                  className={`w-full py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] transition-all ${exam.status === 'LIVE' ? 'bg-slate-900 text-white hover:bg-black shadow-2xl active:scale-95' : 'bg-slate-50 text-slate-300 cursor-not-allowed'}`}
                >
                  {exam.status === 'LIVE' ? 'AUTHENTICATE & START' : 'WAITING FOR COE'}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-5">
            <div className="w-2 h-10 bg-slate-300 rounded-full"></div> Attempt History
          </h3>
          <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-sm overflow-hidden">
             {pastResults.length === 0 ? (
               <div className="p-24 text-center opacity-30">
                 <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
                    <i className="fas fa-box-archive"></i>
                 </div>
                 <p className="text-[10px] font-black uppercase tracking-[0.2em]">No history found</p>
               </div>
             ) : (
               <div className="divide-y divide-slate-50">
                 {pastResults.map((res, i) => (
                   <div key={i} className="p-10 hover:bg-slate-50/50 transition-all flex items-center justify-between group">
                     <div>
                       <h4 className="text-xl font-black text-slate-800 uppercase group-hover:text-indigo-600 transition-colors">{res.examId}</h4>
                       <p className="text-[10px] font-black text-slate-400 uppercase mt-2">{new Date(res.submittedAt).toLocaleDateString()}</p>
                     </div>
                     <div className="flex items-center gap-10">
                       <div className="text-right">
                         <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Score</p>
                         <p className={`text-2xl font-black ${res.isReleased ? 'text-indigo-600' : 'text-slate-300'}`}>
                           {res.isReleased ? res.score : '—'}
                         </p>
                       </div>
                       <button onClick={() => setReviewExam(res)} className="w-16 h-16 bg-white border border-slate-200 rounded-[1.5rem] flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm">
                         <i className="fas fa-chevron-right"></i>
                       </button>
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
