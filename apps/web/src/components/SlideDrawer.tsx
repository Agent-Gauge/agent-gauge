'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface SlideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  badge?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function SlideDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  badge,
  icon,
  children,
}: SlideDrawerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300 animate-fadeIn"
      />

      {/* Drawer Panel */}
      <div className="relative z-10 w-full max-w-5xl h-full bg-[#020509] border-l border-[#00F0FF]/25 shadow-[-20px_0_60px_rgba(0,0,0,0.95)] flex flex-col transform transition-transform duration-300 ease-out animate-slideInRight">
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 px-6 py-4 border-b border-white/10 bg-[#020509]/95 backdrop-blur-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="w-9 h-9 rounded-xl bg-[#091512] border border-[#10F5A0]/40 flex items-center justify-center text-[#10F5A0]">
                {icon}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
                {badge && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30">
                    {badge}
                  </span>
                )}
              </div>
              {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-500 text-xs font-mono text-slate-300 hover:text-white transition-all"
            aria-label="Close drawer"
          >
            <span className="hidden sm:inline text-slate-400">Esc to close</span>
            <X className="w-4 h-4 text-slate-300" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-8 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}
