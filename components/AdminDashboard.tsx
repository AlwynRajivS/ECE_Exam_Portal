
import React, { useState, useEffect } from 'react';
import { Question, QuestionPart, ExamSettings, StudentResult } from '../types';
import { GAS_URL, API_ENABLED } from '../config';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'reports' | 'questions' | 'students' | 'settings'>('reports');
  const [exams, setExams] = useState<ExamSettings[]>([]);
  const [results, setResults] = useState<StudentResult[]>([]);
  
  const [selectedExamId, setSelectedExamId] = useState('SEM-APR-2024');
  const [newQuestion, setNewQuestion] = useState({
    text: '', imageUrl: '', option1: '', option2: '', option3: '', option4: '', correctAnswer: 0, part: QuestionPart.A, examId: selectedExamId
  });

  const [settings, setSettings] = useState<ExamSettings>({
    examId: 'SEM-APR-2024', totalTimeMinutes: 60, maxViolations: 3, partACount: 10, partBCount: 5, isReviewEnabled: false, isReleased: false, isCalculatorEnabled: true
  });

  const handleSaveSettings = async () => {
    if (API_ENABLED) {
      try {
        await fetch(GAS_URL, {
          method: 'POST',
          mode: 'no-cors',
          body: JSON.stringify({ action: 'saveExamSettings', settings })
        });
        alert("Institutional settings propagated successfully.");
      } catch (e) { alert("Deployment failed."); }
    } else {
      alert("Mock Mode: Settings updated locally.");
    }
  };

  const downloadScaffold = (type: 'questions' | 'students' | 'results') => {
    let headers = [];
    if (type === 'questions') headers = ["id", "examId", "text", "imageUrl", "option1", "option2", "option3", "option4", "correctAnswer", "part"];
    else if (type === 'students') headers = ["rollNo", "name", "department", "year", "section", "examId", "password"];
    else headers = ["rollNo", "examId", "score", "violations", "submittedAt", "answers", "status"];
    
    const csvContent = headers.join(",") + "\n";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `KCET_${type}_template.csv`);
    link.click();
  };

  return (
    <div className="max-w-7xl mx-auto pb-20 space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-8 md:p-12 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50"></div>
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase">COE Central</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2">Institutional Command Unit</p>
        </div>
        <div className="flex flex-wrap gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100 w-full md:w-auto z-10">
          {(['reports', 'questions', 'students', 'settings'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 md:flex-none px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-indigo-600 shadow-lg ring-1 ring-slate-100' : 'text-slate-400 hover:text-slate-800'}`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {activeTab === 'settings' && (
          <div className="bg-white p-12 rounded-[3rem] border border-slate-200 shadow-sm space-y-12">
            <div className="flex justify-between items-end">
              <div>
                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Exam Configuration</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Setup Violation Limits and Duration</p>
              </div>
              <button onClick={handleSaveSettings} className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl">Deploy Settings</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="space-y-4">
                 <label className="text-[10px] font-black text-slate-400 uppercase">Exam Identifier</label>
                 <input type="text" value={settings.examId} onChange={e => setSettings({...settings, examId: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 font-bold" />
               </div>
               <div className="space-y-4">
                 <label className="text-[10px] font-black text-slate-400 uppercase">Duration (Minutes)</label>
                 <input type="number" value={settings.totalTimeMinutes} onChange={e => setSettings({...settings, totalTimeMinutes: parseInt(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 font-bold" />
               </div>
               <div className="space-y-4">
                 <label className="text-[10px] font-black text-slate-400 uppercase">Max Violation Strikes</label>
                 <input type="number" value={settings.maxViolations} onChange={e => setSettings({...settings, maxViolations: parseInt(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 font-bold" />
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-50">
               <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase mb-6 tracking-widest">Question Distribution</h4>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase block mb-2">Part A Count (1 Mark)</label>
                      <input type="number" value={settings.partACount} onChange={e => setSettings({...settings, partACount: parseInt(e.target.value)})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold" />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase block mb-2">Part B Count (2 Marks)</label>
                      <input type="number" value={settings.partBCount} onChange={e => setSettings({...settings, partBCount: parseInt(e.target.value)})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold" />
                    </div>
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setSettings({...settings, isCalculatorEnabled: !settings.isCalculatorEnabled})} className={`p-8 rounded-[2rem] border-2 font-black uppercase text-[10px] tracking-widest transition-all ${settings.isCalculatorEnabled ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-slate-50 border-slate-100 text-slate-300'}`}>
                    Calculator {settings.isCalculatorEnabled ? 'ON' : 'OFF'}
                  </button>
                  <button onClick={() => setSettings({...settings, isReleased: !settings.isReleased})} className={`p-8 rounded-[2rem] border-2 font-black uppercase text-[10px] tracking-widest transition-all ${settings.isReleased ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-red-50 border-red-100 text-red-600'}`}>
                    Results {settings.isReleased ? 'PUBLIC' : 'HIDDEN'}
                  </button>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'questions' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-8">
               <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Question Item Management</h3>
               <div className="space-y-6">
                 <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Exam Reference</label>
                   <input type="text" value={newQuestion.examId} onChange={e => setNewQuestion({...newQuestion, examId: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 font-bold text-xs" />
                 </div>
                 <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Question Content (KaTeX Enabled)</label>
                   <textarea value={newQuestion.text} onChange={e => setNewQuestion({...newQuestion, text: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 font-bold text-sm min-h-[100px]" placeholder="e.g. Solve for $x$: $2x = 4$" />
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                   <div>
                     <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Option 1 (Column: option1)</label>
                     <input type="text" value={newQuestion.option1} onChange={e => setNewQuestion({...newQuestion, option1: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold" />
                   </div>
                   <div>
                     <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Option 2 (Column: option2)</label>
                     <input type="text" value={newQuestion.option2} onChange={e => setNewQuestion({...newQuestion, option2: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold" />
                   </div>
                   <div>
                     <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Option 3 (Column: option3)</label>
                     <input type="text" value={newQuestion.option3} onChange={e => setNewQuestion({...newQuestion, option3: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold" />
                   </div>
                   <div>
                     <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Option 4 (Column: option4)</label>
                     <input type="text" value={newQuestion.option4} onChange={e => setNewQuestion({...newQuestion, option4: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold" />
                   </div>
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Correct Answer Index (0-3)</label>
                      <input type="number" min="0" max="3" value={newQuestion.correctAnswer} onChange={e => setNewQuestion({...newQuestion, correctAnswer: parseInt(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Section</label>
                      <select value={newQuestion.part} onChange={e => setNewQuestion({...newQuestion, part: e.target.value as QuestionPart})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-xs">
                        <option value={QuestionPart.A}>Part A (1 Mark)</option>
                        <option value={QuestionPart.B}>Part B (2 Marks)</option>
                      </select>
                    </div>
                 </div>
                 <button className="w-full bg-indigo-600 text-white font-black py-6 rounded-2xl shadow-xl hover:bg-indigo-700 transition-all uppercase tracking-widest text-[10px]">Commit Question to Bank</button>
               </div>
            </div>
            <div className="bg-slate-900 p-10 rounded-[3rem] text-white space-y-10">
               <div>
                 <h4 className="text-lg font-black uppercase mb-4">Template Export</h4>
                 <div className="space-y-3">
                   <button onClick={() => downloadScaffold('questions')} className="w-full bg-white/5 border border-white/10 text-white py-4 rounded-xl text-[9px] font-black uppercase hover:bg-white/10 transition-all">Questions CSV (Separated Options)</button>
                   <button onClick={() => downloadScaffold('students')} className="w-full bg-white/5 border border-white/10 text-white py-4 rounded-xl text-[9px] font-black uppercase hover:bg-white/10 transition-all">Students CSV</button>
                 </div>
               </div>
               <div className="bg-indigo-600/20 p-6 rounded-2xl border border-indigo-500/20">
                 <h4 className="text-[10px] font-black uppercase mb-3 text-indigo-400">Institutional Logic</h4>
                 <p className="text-[9px] font-bold text-slate-400 leading-relaxed uppercase">Options must be stored in separate columns (option1, option2, etc.) to allow for easy bulk editing in standard spreadsheet software.</p>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
