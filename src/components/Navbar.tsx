import React, { useState } from 'react';
import { Logo } from './Logo';
import { 
  Instagram, 
  Facebook,
  Youtube, 
  Phone, 
  Mail, 
  Palette, 
  User, 
  Send, 
  ShieldCheck, 
  Menu, 
  X,
  MessageCircle
} from 'lucide-react';
import { ARTIST_PROFILE } from '../data/initialData';

interface NavbarProps {
  currentTab: 'gallery' | 'about' | 'commission' | 'admin';
  setCurrentTab: (tab: 'gallery' | 'about' | 'commission' | 'admin') => void;
  onOpenQuickEnquiry?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'gallery', label: 'Portfolio' },
    { id: 'about', label: 'About the Artist' },
    { id: 'commission', label: 'Commissions' },
    { id: 'admin', label: 'Admin Login', isSpecial: true }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#F7F1E7]/98 backdrop-blur-sm border-b border-[#D6C8B8] transition-all duration-200">
      {/* Top micro announcement bar - Dark Brown #4A2F1F with Cream/White text */}
      <div className="bg-[#4A2F1F] text-[#F7F1E7] text-xs py-1.5 px-4 sm:px-10">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-[10px] uppercase tracking-widest font-sans-ui">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-[#F7F1E7]">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#A8753F] animate-pulse"></span>
              Authentic Original Fine Artworks • Vishal Baru
            </span>
            <span className="hidden md:inline-block text-[#E9DDCC]/40">|</span>
            <span className="hidden md:inline-block text-[#E9DDCC]">
              Masuda Road, Beawar 305901, Rajasthan
            </span>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <a 
              href={`https://wa.me/918000917547?text=${encodeURIComponent('Hi Vishal ji, I visited Baru Sketch Gallery and would like to inquire about your paintings.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[#F7F1E7] hover:text-[#E9DDCC] transition-colors"
              title="Chat with Vishal Baru on WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>+91 8000917547</span>
            </a>

            <div className="flex items-center gap-3 border-l border-white/20 pl-3">
              <a 
                href={ARTIST_PROFILE.instagram} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#F7F1E7] opacity-80 hover:opacity-100 transition-opacity"
                title="Instagram @baru_sketch_gallery"
                aria-label="Instagram"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a 
                href={ARTIST_PROFILE.facebook} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#F7F1E7] opacity-80 hover:opacity-100 transition-opacity"
                title="Facebook - Baru Sketch Gallery"
                aria-label="Facebook"
              >
                <Facebook className="w-3.5 h-3.5" />
              </a>
              <a 
                href={ARTIST_PROFILE.youtube} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#F7F1E7] opacity-80 hover:opacity-100 transition-opacity"
                title="YouTube @Vishalbaru"
                aria-label="YouTube"
              >
                <Youtube className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main navigation header - Cream #F7F1E7 background with Dark Brown #2D241E text */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-4 flex items-center justify-between">
        {/* Brand Logo */}
        <button 
          id="nav-logo-btn"
          onClick={() => setCurrentTab('gallery')}
          className="text-left focus:outline-none focus:ring-1 focus:ring-[#6B452D] p-0.5 rounded-md"
        >
          <Logo size="md" />
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-xs uppercase tracking-widest font-sans-ui">
          {navItems.map(item => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-link-${item.id}`}
                onClick={() => setCurrentTab(item.id as any)}
                className={`py-1 transition-all ${
                  isActive 
                    ? 'border-b-2 border-[#6B452D] text-[#6B452D] font-bold' 
                    : item.isSpecial
                    ? 'text-[#6B452D] font-bold opacity-80 hover:opacity-100'
                    : 'text-[#2D241E] opacity-75 hover:opacity-100 hover:text-[#6B452D]'
                }`}
              >
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Action Button & Contact */}
        <div className="hidden lg:flex items-center gap-3">
          <a
            href={`https://wa.me/918000917547?text=${encodeURIComponent('Hi Vishal, I would like to book a custom painting commission.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#6B452D] text-[#FFFFFF] px-6 py-2.5 text-xs uppercase tracking-[0.2em] font-sans-ui hover:bg-[#4A2F1F] transition-colors inline-flex items-center gap-2 rounded-md shadow-xs"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>WhatsApp Inquiry</span>
          </a>
        </div>

        {/* Mobile menu toggle button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            id="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#2D241E] hover:text-[#6B452D] focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#D6C8B8] bg-[#F7F1E7] px-6 pt-4 pb-6 space-y-3 shadow-lg">
          {navItems.map(item => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id as any);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between py-2.5 text-xs uppercase tracking-widest font-sans-ui text-left ${
                  isActive 
                    ? 'border-b-2 border-[#6B452D] font-bold text-[#6B452D]' 
                    : item.isSpecial
                    ? 'text-[#6B452D] font-bold opacity-90'
                    : 'text-[#2D241E] opacity-75 hover:opacity-100'
                }`}
              >
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-4 border-t border-[#D6C8B8] mt-3 space-y-3">
            <a
              href="https://wa.me/918000917547"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#6B452D] text-white text-xs uppercase tracking-widest font-sans-ui hover:bg-[#4A2F1F] transition-colors rounded-md"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp (+91 8000917547)</span>
            </a>
            
            <div className="flex justify-center items-center gap-5 py-1 text-xs text-[#4A2F1F]">
              <a href={ARTIST_PROFILE.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-[#2D241E] transition-colors flex items-center gap-1 font-sans-ui uppercase tracking-wider text-[10px]">
                <Instagram className="w-3.5 h-3.5" />
                <span>Instagram</span>
              </a>
              <a href={ARTIST_PROFILE.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-[#2D241E] transition-colors flex items-center gap-1 font-sans-ui uppercase tracking-wider text-[10px]">
                <Facebook className="w-3.5 h-3.5" />
                <span>Facebook</span>
              </a>
              <a href={ARTIST_PROFILE.youtube} target="_blank" rel="noopener noreferrer" className="hover:text-[#2D241E] transition-colors flex items-center gap-1 font-sans-ui uppercase tracking-wider text-[10px]">
                <Youtube className="w-3.5 h-3.5" />
                <span>YouTube</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

