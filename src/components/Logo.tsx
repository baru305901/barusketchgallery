import React from 'react';
import { Palette } from 'lucide-react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', showTagline = true }) => {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Visual Palette Icon with refined Warm Brown + Cream styling */}
      <div className="relative flex items-center justify-center">
        <div className={`rounded-xl bg-[#4A2F1F] p-2 text-[#F7F1E7] border border-[#6B452D]/40 flex items-center justify-center shadow-xs ${
          size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-10 h-10'
        }`}>
          <Palette className={`${size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'} text-[#E9DDCC]`} />
        </div>
        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#A8753F] border border-white"></span>
        </span>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col">
        <h1 className={`font-cinzel font-bold tracking-tight uppercase text-[#2D241E] leading-tight ${
          size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-xl'
        }`}>
          BARU SKETCH GALLERY
        </h1>
        {showTagline && (
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#7B6858] font-sans-ui font-medium">
            Fine Art by Vishal Baru
          </span>
        )}
      </div>
    </div>
  );
};

