import React from 'react';
import { Logo } from './Logo';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Instagram, 
  Youtube, 
  Heart, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  ArrowUp,
  MessageCircle,
  Truck,
  Award,
  Palette
} from 'lucide-react';
import { ARTIST_PROFILE } from '../data/initialData';

interface FooterProps {
  onNavigate: (tab: 'gallery' | 'about' | 'commission' | 'admin') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#1A1A1A] text-[#FDFBF7] pt-14 pb-8 border-t border-[#1A1A1A] font-sans-ui mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          
          {/* Brand & Artist Intro */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2A2A2A] text-[#FDFBF7] border border-white/15 flex items-center justify-center">
                <Palette className="w-5 h-5 text-[#DCD6C8]" />
              </div>
              <div className="flex flex-col">
                <span className="font-cinzel text-lg font-bold tracking-tight text-[#FDFBF7] uppercase">
                  BARU SKETCH GALLERY
                </span>
                <span className="text-[10px] uppercase tracking-[0.3em] opacity-60 font-medium">
                  Fine Art by Vishal Baru
                </span>
              </div>
            </div>

            <p className="font-cormorant text-base text-[#D6D0C5] italic leading-relaxed">
              "Chitrakari ek anokhi kala hai jo imagination ko samne la deta hai." Original Pichwai paintings, lifelike charcoal sketches, and luminous watercolors created with passion in Beawar, Rajasthan.
            </p>
            
            <div className="flex items-center gap-3 pt-2">
              <a 
                href={ARTIST_PROFILE.instagram} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-[#2A2A2A] hover:bg-[#5A5A40] text-[#FDFBF7] flex items-center justify-center transition-all duration-200 border border-white/10"
                aria-label="Instagram"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a 
                href={ARTIST_PROFILE.youtube} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-[#2A2A2A] hover:bg-[#8B0000] text-[#FDFBF7] flex items-center justify-center transition-all duration-200 border border-white/10"
                aria-label="YouTube"
                title="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a 
                href={`https://wa.me/918000917547?text=${encodeURIComponent('Namaste Vishal ji, I have an inquiry regarding Baru Sketch Gallery.')}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-[#2A2A2A] hover:bg-[#2F4F4F] text-[#FDFBF7] flex items-center justify-center transition-all duration-200 border border-white/10"
                aria-label="WhatsApp"
                title="WhatsApp Direct"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
              </a>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-[0.25em] font-bold text-[#EFEBE4] border-b border-white/10 pb-2 inline-block">
              EXPLORE ART
            </h3>
            <ul className="space-y-2.5 text-xs uppercase tracking-widest font-medium text-[#C4BEB2]">
              <li>
                <button 
                  onClick={() => onNavigate('gallery')}
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3 h-3 text-[#5A5A40]" />
                  <span>Browse Portfolio</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('gallery')}
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3 h-3 text-[#5A5A40]" />
                  <span>Devotional Pichwai Art</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('gallery')}
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3 h-3 text-[#5A5A40]" />
                  <span>Hyper-Realistic Sketches</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('about')}
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3 h-3 text-[#5A5A40]" />
                  <span>About Artist Vishal Baru</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('commission')}
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3 h-3 text-[#5A5A40]" />
                  <span>Custom Commissions</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Artist Contact Information */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-[0.25em] font-bold text-[#EFEBE4] border-b border-white/10 pb-2 inline-block">
              STUDIO & CONTACT
            </h3>
            
            <div className="space-y-3 text-xs text-[#C4BEB2]">
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#DCD6C8] shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-[#8F8A7E]">Mobile & WhatsApp</div>
                  <a 
                    href="tel:+918000917547" 
                    className="text-[#FDFBF7] hover:text-[#5A5A40] transition-colors font-medium"
                  >
                    +91 8000917547
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#DCD6C8] shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-[#8F8A7E]">Email Address</div>
                  <a 
                    href="mailto:sketchartis007@gmail.com" 
                    className="text-[#FDFBF7] hover:text-[#5A5A40] transition-colors font-medium break-all"
                  >
                    sketchartis007@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#DCD6C8] shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-[#8F8A7E]">Studio Location</div>
                  <p className="text-[#FDFBF7] leading-tight">
                    Masuda Road, Beawar 305901<br />
                    <span className="text-[11px] text-[#A8A49A]">Rajasthan, India</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Gallery Guarantees & Future E-commerce */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-[0.25em] font-bold text-[#EFEBE4] border-b border-white/10 pb-2 inline-block">
              AUTHENTICITY & TRUST
            </h3>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-[#2A2A2A] border border-white/10 flex items-start gap-2.5">
                <Award className="w-4 h-4 text-[#DCD6C8] shrink-0 mt-0.5" />
                <div className="text-xs text-[#C4BEB2]">
                  <strong className="text-[#FDFBF7] block font-medium">Signed Certificate</strong>
                  Every original painting comes with a physical certificate of authenticity.
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#2A2A2A] border border-white/10 flex items-start gap-2.5">
                <Truck className="w-4 h-4 text-[#DCD6C8] shrink-0 mt-0.5" />
                <div className="text-xs text-[#C4BEB2]">
                  <strong className="text-[#FDFBF7] block font-medium">Museum Grade Packing</strong>
                  Insured courier shipping with wooden corner protectors and bubble wrap.
                </div>
              </div>

              <div className="pt-1">
                <button
                  onClick={() => onNavigate('admin')}
                  className="text-xs text-[#A8A49A] hover:text-white transition-colors flex items-center gap-1.5 uppercase tracking-widest text-[10px]"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Artist Admin Portal</span>
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright line */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8F8A7E]">
          <div className="text-center sm:text-left">
            © {new Date().getFullYear()} Baru Sketch Gallery by Vishal Baru. All rights reserved. Masuda Road, Beawar 305901.
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 hover:text-white text-xs transition-colors p-1"
              aria-label="Back to top"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

