import React from 'react';
import { 
  Palette, 
  Heart, 
  Sparkles, 
  MapPin, 
  Phone, 
  Mail, 
  Instagram, 
  Facebook,
  Youtube, 
  Award, 
  Layers, 
  Brush,
  Compass,
  ArrowRight,
  Quote
} from 'lucide-react';
import { ARTIST_PROFILE } from '../data/initialData';

interface AboutViewProps {
  onOpenCommission: () => void;
  onBrowseGallery: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onOpenCommission, onBrowseGallery }) => {
  const studioPhotos = [
    {
      url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80",
      caption: "Natural Stone Pigment Grinding & Pichwai Washes"
    },
    {
      url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80",
      caption: "Masterwork on Stretched Cotton Fabric"
    },
    {
      url: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=800&q=80",
      caption: "Studio Easel & Fine Squirrel Hair Brushes"
    },
    {
      url: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80",
      caption: "Hyper-Realistic Graphite & Charcoal Rendering"
    }
  ];

  return (
    <div className="space-y-12 pb-16">
      
      {/* Top Hero Section */}
      <section className="bg-[#F7F1E7] rounded-2xl p-8 sm:p-12 md:p-14 border border-[#D6C8B8] shadow-xs relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Text & Biography */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E9DDCC] border border-[#D6C8B8] text-[#6B452D] text-[10px] font-bold uppercase tracking-[0.25em] font-sans-ui rounded-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Artist Biography & Heritage</span>
            </div>

            <h1 className="font-cinzel text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2D241E] leading-tight">
              Vishal Baru
            </h1>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#6B452D] font-sans-ui">
              Master Traditional Painter & Realistic Portraitist • Beawar, Rajasthan
            </p>

            {/* Exact Artist Statement in Hindi (As strictly requested) */}
            <div className="relative p-6 sm:p-7 rounded-r-xl bg-[#E9DDCC]/60 border-l-4 border-[#6B452D] shadow-inner space-y-3">
              <Quote className="w-8 h-8 text-[#6B452D]/30 absolute top-4 right-4" />
              
              <div className="text-[10px] uppercase tracking-widest font-bold text-[#6B452D] font-sans-ui">
                Artist's Words (कलाकार के शब्द):
              </div>

              {/* Exact quote text required by user */}
              <p className="font-cormorant text-xl sm:text-2xl text-[#2D241E] leading-relaxed italic font-medium">
                "{ARTIST_PROFILE.bioHindi}"
              </p>

              <div className="pt-2 border-t border-[#D6C8B8] text-xs text-[#4A2F1F] leading-normal font-sans-ui">
                <strong className="text-[#2D241E]">English Translation:</strong> {ARTIST_PROFILE.bioEnglish}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onOpenCommission}
                className="px-6 py-3 bg-[#6B452D] hover:bg-[#4A2F1F] text-[#FFFFFF] font-semibold text-xs uppercase tracking-[0.2em] font-sans-ui transition-all shadow-xs flex items-center gap-2 rounded-md"
              >
                <span>Commission Artwork</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href={`https://wa.me/918000917547?text=${encodeURIComponent('Namaste Vishal ji, I read your biography on Baru Sketch Gallery and would love to discuss an art piece.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-white hover:bg-[#E9DDCC] text-[#2D241E] font-medium text-xs uppercase tracking-[0.15em] font-sans-ui border border-[#D6C8B8] transition-colors rounded-md"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>

          {/* Artist Portrait & Visual Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md rounded-2xl overflow-hidden shadow-xl border border-[#D6C8B8] bg-[#2D241E] aspect-3/4">
              <img 
                src="https://lnpjssonfwpybetvumrj.supabase.co/storage/v1/object/public/painting-images/ChatGPT%20Image%20Sep%204,%202026,%2012_04_51%20PM.png" 
                alt="Artist Vishal Baru at Work"
                className="w-full h-full object-cover"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex flex-col justify-end p-6 text-white">
                <div className="font-cinzel text-xl font-bold">Vishal Baru</div>
                <div className="text-xs text-[#E9DDCC] font-sans-ui">Founder, Baru Sketch Gallery</div>
                <div className="text-xs text-[#E9DDCC] mt-1 flex items-center gap-1.5 font-sans-ui">
                  <MapPin className="w-3.5 h-3.5 text-[#A8753F]" />
                  <span>Masuda Road, Beawar 305901 (Rajasthan)</span>
                </div>
              </div>
            </div>

            {/* Floating Experience Badge */}
            <div className="absolute -bottom-4 -left-4 bg-[#4A2F1F] text-[#F7F1E7] p-4 rounded-xl shadow-xl border border-white/10 hidden sm:flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#3D2517] text-[#E9DDCC] border border-white/15 flex items-center justify-center font-bold text-base font-cinzel">
                VB
              </div>
              <div className="text-xs font-sans-ui">
                <div className="font-bold text-[#F7F1E7] uppercase tracking-wider text-[11px]">Generational Artistry</div>
                <div className="text-[#E9DDCC] text-[10px]">Learned under master artist father</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Artistic Domains & Specializations */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-[#2D241E]">
            Artistic Disciplines & Mediums
          </h2>
          <p className="text-xs sm:text-sm text-[#7B6858] font-sans-ui">
            Combining age-old Rajasthani traditional heritage techniques with contemporary realism and fine draftsmanship.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-white border border-[#D6C8B8] space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-[#4A2F1F] text-[#E9DDCC] flex items-center justify-center">
              <Layers className="w-5 h-5 text-[#E9DDCC]" />
            </div>
            <h3 className="font-cinzel text-lg font-bold text-[#2D241E]">
              Sacred Pichwai Paintings
            </h3>
            <p className="text-xs text-[#4A2F1F] leading-relaxed font-sans-ui">
              Rooted in the devotional traditions of Nathdwara. Painted on hand-treated organic cotton using authentic stone colors, real 24K gold foil, and botanical binders.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white border border-[#D6C8B8] space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-[#4A2F1F] text-[#E9DDCC] flex items-center justify-center">
              <Brush className="w-5 h-5 text-[#E9DDCC]" />
            </div>
            <h3 className="font-cinzel text-lg font-bold text-[#2D241E]">
              Hyper-Realistic Sketches
            </h3>
            <p className="text-xs text-[#4A2F1F] leading-relaxed font-sans-ui">
              Master-level charcoal and graphite portraits capturing emotional expressions, intricate textures, wrinkles of wisdom, and soulful depth on heavyweight archival paper.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white border border-[#D6C8B8] space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-[#4A2F1F] text-[#E9DDCC] flex items-center justify-center">
              <Palette className="w-5 h-5 text-[#E9DDCC]" />
            </div>
            <h3 className="font-cinzel text-lg font-bold text-[#2D241E]">
              Luminous Watercolors
            </h3>
            <p className="text-xs text-[#4A2F1F] leading-relaxed font-sans-ui">
              Capturing atmospheric desert light, holy ghats of Pushkar, vibrant Marwar architecture, and Rajasthani culture through transparent, delicate pigment layers.
            </p>
          </div>
        </div>
      </section>

      {/* Studio Space & Workspace Gallery */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#6B452D] font-sans-ui">
              Inside The Atelier
            </div>
            <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-[#2D241E]">
              Studio & Creative Process
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#7B6858] max-w-md font-sans-ui">
            Located at Masuda Road, Beawar. Where raw pigments, pure cotton canvases, and graphite transform into timeless art pieces.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {studioPhotos.map((item, idx) => (
            <div key={idx} className="group relative rounded-xl overflow-hidden aspect-4/3 bg-[#2D241E] border border-[#D6C8B8] shadow-xs">
              <img 
                src={item.url} 
                alt={item.caption}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-4">
                <span className="text-xs text-white/95 font-medium leading-tight font-sans-ui">
                  {item.caption}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Studio Location & Social Connect */}
      <section className="p-8 sm:p-10 rounded-2xl bg-[#4A2F1F] text-[#F7F1E7] border border-[#3D2517] space-y-6 font-sans-ui">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h3 className="font-cinzel text-2xl font-bold text-[#F7F1E7]">
              Visit or Contact Vishal Baru
            </h3>
            <p className="text-xs sm:text-sm text-[#E9DDCC] leading-relaxed">
              Whether you wish to inspect original paintings in person, order custom wall artworks for your home or temple, or seek guidance on commissioning Pichwais, you are always welcome.
            </p>

            <div className="space-y-2.5 text-xs pt-2">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-[#A8753F]" />
                <span className="text-[#F7F1E7]">Masuda Road, Beawar 305901, Rajasthan, India</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#A8753F]" />
                <a href="tel:+918000917547" className="text-[#F7F1E7] hover:text-white transition-colors">+91 8000917547</a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#A8753F]" />
                <a href="mailto:sketchartis007@gmail.com" className="text-[#F7F1E7] hover:text-white transition-colors">sketchartis007@gmail.com</a>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end justify-center gap-4">
            <div className="text-[10px] uppercase tracking-widest text-[#E9DDCC]">Follow Vishal Baru's Artwork Journey:</div>
            <div className="flex items-center gap-3 flex-wrap">
              <a
                href={ARTIST_PROFILE.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-lg bg-[#3D2517] hover:bg-[#6B452D] text-[#F7F1E7] border border-white/10 text-xs font-semibold flex items-center gap-2 transition-all uppercase tracking-wider text-[11px]"
              >
                <Instagram className="w-4 h-4" />
                <span>@baru_sketch_gallery</span>
              </a>

              <a
                href={ARTIST_PROFILE.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-lg bg-[#3D2517] hover:bg-[#6B452D] text-[#F7F1E7] border border-white/10 text-xs font-semibold flex items-center gap-2 transition-all uppercase tracking-wider text-[11px]"
              >
                <Facebook className="w-4 h-4" />
                <span>Baru sketch gallery</span>
              </a>

              <a
                href={ARTIST_PROFILE.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-lg bg-[#3D2517] hover:bg-[#6B452D] text-[#F7F1E7] border border-white/10 text-xs font-semibold flex items-center gap-2 transition-all uppercase tracking-wider text-[11px]"
              >
                <Youtube className="w-4 h-4" />
                <span>@Vishalbaru</span>
              </a>
            </div>

            <button
              onClick={onBrowseGallery}
              className="mt-2 text-xs text-[#E9DDCC] hover:text-white flex items-center gap-1 font-medium uppercase tracking-widest text-[11px]"
            >
              <span>Explore full painting collection</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#A8753F]" />
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
