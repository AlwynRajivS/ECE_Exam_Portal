
import React from 'react';
import { AuthState } from '../types';

interface HeaderProps {
  auth: AuthState;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ auth, onLogout }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-700 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-100">
          <i className="fas fa-graduation-cap"></i>
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-800 leading-tight">
            Kamaraj College
          </h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
            Controller of Examination
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {auth.role && (
          <div className="flex items-center gap-3">
            <div className="hidden md:block text-right">
              <p className="text-xs font-medium text-slate-800">{auth.user?.name || 'User'}</p>
              <p className="text-[10px] text-slate-500 uppercase font-black">{auth.role}</p>
            </div>
            <button 
              onClick={onLogout}
              className="text-slate-400 hover:text-red-600 transition-all p-2 bg-slate-50 rounded-lg"
              title="Logout"
            >
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
