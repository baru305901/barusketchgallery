import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  MessageCircle, 
  Tag, 
  Maximize2, 
  ShieldCheck, 
  Truck, 
  Award, 
  Sparkles, 
  HelpCircle, 
  Share2, 
  Check, 
  ExternalLink,
  Code,
  Info,
  Calendar,
  Layers,
  Palette,
  ChevronLeft,
  ChevronRight,
  Images
} from 'lucide-react';
import { Painting } from '../types';
import { FuturePaymentModal } from './FuturePaymentModal';

interface PaintingDetailModalProps {
  painting: Painting | null;
  isOpen: boolean;
  onClose: () => void;
  onInquireCustom?: (painting: Painting) => void;
}

export const PaintingDetailModal: React.FC<PaintingDetailModalProps> = ({ 
  painting, 
  isOpen, 
  onClose,
  onInquireCustom 
}) => {
  const [showFuturePayment, setShowFuturePayment] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Normalize images list with backwards compatibility
  const imagesList = useMemo(() => {
    if (!painting) return [];
    if (Array.isArray(painting.images) && painting.images.length > 0) {
      const valid = painting.images.filter(img => typeof img === 'string' && img.trim().length > 0);
      if (valid.length > 0) return valid;
    }
    return painting.image_url ? [painting.image_url] : [];
  }, [painting]);

  // Reset active image index and zoom on painting change or open
  useEffect(() => {
    setActiveImageIndex(0);
    setIsZoomed(false);
  }, [painting?.id, isOpen]);

  // Arrow key navigation when modal is open
  useEffect(() => {
    if (!isOpen || imagesList.length <= 1) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setActiveImageIndex(prev => (prev === 0 ? imagesList.length - 1 : prev - 1));
      } else if (e.key === 'ArrowRight') {
        setActiveImageIndex(prev => (prev === imagesList.length - 1 ? 0 : prev + 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, imagesList.length]);

  if (!isOpen || !painting) return null;

  const currentDisplayImage = imagesList[activeImageIndex] || painting.image_url;
  const isAvailable = painting.status?.trim().toLowerCase() === 'available';

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsZoomed(false);
    setActiveImageIndex(prev => (prev === 0 ? imagesList.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsZoomed(false);
    setActiveImageIndex(prev => (prev === imagesList.length - 1 ? 0 : prev + 1));
  };

  // Construct customized WhatsApp message link as specified
  const whatsappMessage = `Hi Vishal, I am interested in buying your painting: '${painting.name}' (Size: ${painting.size}, Price: ₹${painting.price.toLocaleString('en-IN')}). Please provide details regarding shipping and payment.`;
  const whatsappUrl = `https://wa.me/918000917547?text=${encodeURIComponent(whatsappMessage)}`;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
        <div className="bg-[#F7F1E7] text-[#2D241E] w-full max-w-5xl rounded-2xl shadow-2xl border border-[#D6C8B8] overflow-hidden my-auto flex flex-col md:flex-row relative max-h-[92vh]">
          
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/95 hover:bg-white text-[#2D241E] shadow-md border border-[#D6C8B8] transition-all duration-200 focus:outline-none"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left Column: High-Res Painting Image Preview & Multi-Image Gallery */}
          <div className="md:w-1/2 bg-[#2D241E] flex flex-col items-center justify-between relative p-4 sm:p-5 overflow-hidden min-h-[380px] md:min-h-[520px]">
            
            {/* Top Indicator: Photo counter & authenticity */}
            <div className="w-full flex items-center justify-between z-10 text-[10px] font-sans-ui text-white/90 pb-2">
              <span className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded border border-white/15 flex items-center gap-1.5 font-medium">
                <Images className="w-3.5 h-3.5 text-[#E9DDCC]" />
                <span>Photo {activeImageIndex + 1} of {imagesList.length}</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider bg-[#6B452D] text-[#FFFFFF] px-2.5 py-1 rounded font-cinzel font-semibold shadow-xs">
                Authentic Vishal Baru Original
              </span>
            </div>

            {/* Main Image Stage with Next/Prev Arrows */}
            <div className="relative w-full flex-1 flex items-center justify-center group overflow-hidden py-1">
              <img 
                src={currentDisplayImage} 
                alt={`${painting.name} - View ${activeImageIndex + 1}`}
                className={`max-h-[50vh] md:max-h-[56vh] w-auto max-w-full object-contain rounded shadow-2xl transition-all duration-300 ${
                  isZoomed ? 'scale-125 cursor-zoom-out' : 'group-hover:scale-[1.01] cursor-zoom-in'
                }`}
                onClick={() => setIsZoomed(!isZoomed)}
                loading="eager"
              />

              {/* Prev Button */}
              {imagesList.length > 1 && (
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all duration-150 focus:outline-none shadow-lg"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}

              {/* Next Button */}
              {imagesList.length > 1 && (
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all duration-150 focus:outline-none shadow-lg"
                  aria-label="Next photo"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}

              {/* Zoom hint overlay */}
              <div className="absolute bottom-2 left-2 pointer-events-none font-sans-ui">
                <span className="text-[9px] uppercase tracking-wider bg-black/70 backdrop-blur-md text-white/80 px-2 py-0.5 rounded">
                  {isZoomed ? 'Click to zoom out' : 'Click to magnify'}
                </span>
              </div>
            </div>

            {/* Bottom: Multi-Photo Thumbnail Bar */}
            {imagesList.length > 1 && (
              <div className="w-full pt-2.5 z-10">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full scrollbar-thin scrollbar-thumb-stone-700">
                  {imagesList.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setIsZoomed(false);
                        setActiveImageIndex(idx);
                      }}
                      className={`relative shrink-0 w-13 h-13 rounded-lg overflow-hidden border-2 transition-all duration-150 ${
                        activeImageIndex === idx 
                          ? 'border-[#A8753F] ring-2 ring-[#A8753F]/40 scale-105 opacity-100' 
                          : 'border-white/20 opacity-60 hover:opacity-100 hover:border-white/50'
                      }`}
                      aria-label={`View photo ${idx + 1}`}
                    >
                      <img 
                        src={imgUrl} 
                        alt={`Thumbnail ${idx + 1}`} 
                        className="w-full h-full object-cover" 
                      />
                      {activeImageIndex === idx && (
                        <div className="absolute inset-0 bg-[#A8753F]/15 pointer-events-none" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Detailed Artwork Information & Purchase CTA */}
          <div className="md:w-1/2 p-6 sm:p-8 overflow-y-auto flex flex-col justify-between space-y-6 font-sans-ui bg-[#F7F1E7]">
            
            {/* Top metadata & Badges */}
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-[#E9DDCC] text-[#4A2F1F] border border-[#D6C8B8] rounded-sm">
                    {painting.type}
                  </span>
                  
                  {painting.featured && (
                    <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-[#6B452D] text-[#FFFFFF] flex items-center gap-1 rounded-sm shadow-xs">
                      <Sparkles className="w-3 h-3 text-[#E9DDCC]" />
                      Featured Masterpiece
                    </span>
                  )}
                </div>

                {/* Status Indicator */}
                <div>
                  {isAvailable ? (
                    <span className="available-badge bg-emerald-600 text-white border border-emerald-400/60 shadow-xs rounded-full px-3 py-1 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider font-sans-ui">
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                      <span>Available</span>
                    </span>
                  ) : (
                    <span 
                      style={{ backgroundColor: '#d60808' }}
                      className="sold-badge bg-[#d60808] text-white border border-red-400/60 shadow-xs rounded-full px-3 py-1 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider font-sans-ui"
                    >
                      <span className="w-2 h-2 rounded-full bg-white/90"></span>
                      <span>Sold Out</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Painting Title */}
              <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-[#2D241E] leading-tight">
                {painting.name}
              </h2>

              <div className="flex items-center gap-2 text-xs text-[#4A2F1F] uppercase tracking-wider">
                <span>Artist:</span>
                <span className="font-bold text-[#6B452D]">Vishal Baru</span>
                <span className="opacity-40">•</span>
                <span>Beawar, Rajasthan</span>
              </div>

              {/* Price Display */}
              <div className="p-4 rounded-xl bg-[#E9DDCC]/60 border border-[#D6C8B8] flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-[#6B452D] font-bold">
                    Original Artwork Price
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-[#2D241E] font-cinzel">
                    ₹{painting.price.toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-wider text-[#7B6858]">Packing & Courier</div>
                  <div className="text-xs font-semibold text-[#4A2F1F]">Free Insured Delivery in India</div>
                </div>
              </div>

              {/* Specifications Grid */}
              <div className="grid grid-cols-2 gap-3 py-1">
                <div className="p-3 rounded-lg bg-white border border-[#D6C8B8]">
                  <div className="text-[10px] uppercase tracking-wider text-[#7B6858] flex items-center gap-1 mb-0.5">
                    <Maximize2 className="w-3 h-3 text-[#6B452D]" />
                    <span>Canvas Dimensions</span>
                  </div>
                  <div className="font-bold text-xs text-[#2D241E] font-cinzel">{painting.size}</div>
                </div>

                <div className="p-3 rounded-lg bg-white border border-[#D6C8B8]">
                  <div className="text-[10px] uppercase tracking-wider text-[#7B6858] flex items-center gap-1 mb-0.5">
                    <Palette className="w-3 h-3 text-[#6B452D]" />
                    <span>Art Form / Medium</span>
                  </div>
                  <div className="font-bold text-xs text-[#2D241E]">{painting.type}</div>
                </div>

                {painting.medium_details && (
                  <div className="col-span-2 p-3 rounded-lg bg-white border border-[#D6C8B8]">
                    <div className="text-[10px] uppercase tracking-wider text-[#7B6858] flex items-center gap-1 mb-0.5">
                      <Layers className="w-3 h-3 text-[#6B452D]" />
                      <span>Materials & Pigments</span>
                    </div>
                    <div className="text-xs text-[#4A2F1F] leading-relaxed font-cormorant text-base italic">
                      {painting.medium_details}
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6B452D]">
                  Artwork Description
                </h4>
                <p className="text-sm text-[#4A2F1F] leading-relaxed font-cormorant text-lg italic">
                  "{painting.description}"
                </p>
              </div>

              {/* Authenticity & Shipping badges */}
              <div className="space-y-2 pt-2 border-t border-[#D6C8B8]">
                <div className="flex items-center gap-2 text-xs text-[#4A2F1F]">
                  <Award className="w-4 h-4 text-[#6B452D]" />
                  <span>Includes Physical Signed Certificate of Authenticity</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#4A2F1F]">
                  <Truck className="w-4 h-4 text-[#6B452D]" />
                  <span>Dispatched with museum-grade wooden protection casing</span>
                </div>
              </div>
            </div>

            {/* Action Buttons Section */}
            <div className="space-y-3 pt-4 border-t border-[#D6C8B8]">
              
              {/* PRIMARY ACTION: BUY NOW via WhatsApp */}
              {isAvailable ? (
                <a
                  id="painting-buy-now-whatsapp-btn"
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-[#6B452D] hover:bg-[#4A2F1F] text-[#FFFFFF] font-semibold text-xs uppercase tracking-[0.2em] transition-all duration-200 shadow-xs rounded-md"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-300" />
                  <span>Buy Now via WhatsApp (+91 8000917547)</span>
                </a>
              ) : (
                <div className="space-y-2">
                  <div className="w-full py-3 px-4 bg-[#E9DDCC] text-[#4A2F1F] font-semibold text-center text-xs uppercase tracking-wider rounded-md border border-[#D6C8B8]">
                    This original piece is currently in a private collection.
                  </div>
                  {onInquireCustom && (
                    <button
                      onClick={() => {
                        onClose();
                        onInquireCustom(painting);
                      }}
                      className="w-full py-3 px-4 bg-[#6B452D] hover:bg-[#4A2F1F] text-white font-semibold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-colors rounded-md shadow-xs"
                    >
                      <span>Commission a Similar Custom Painting</span>
                    </button>
                  )}
                </div>
              )}

              {/* Secondary options */}
              <div className="flex items-center gap-2">
                {isAvailable && onInquireCustom && (
                  <button
                    onClick={() => {
                      onClose();
                      onInquireCustom(painting);
                    }}
                    className="flex-1 py-2.5 px-3 border border-[#D6C8B8] hover:border-[#6B452D] text-[#4A2F1F] hover:bg-[#E9DDCC]/50 text-xs uppercase tracking-wider font-semibold transition-colors flex items-center justify-center gap-1.5 rounded-md"
                  >
                    <span>Custom Size Inquiry</span>
                  </button>
                )}

                <button
                  onClick={handleShare}
                  className="p-2.5 border border-[#D6C8B8] hover:border-[#6B452D] text-[#4A2F1F] hover:bg-[#E9DDCC]/50 transition-colors rounded-md"
                  title="Share painting link"
                >
                  {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                </button>

                {/* Developer Future Payment Gateway Toggle */}
                <button
                  onClick={() => setShowFuturePayment(true)}
                  className="p-2.5 border border-[#D6C8B8] hover:bg-[#E9DDCC]/50 text-[#4A2F1F] transition-colors flex items-center gap-1 text-xs uppercase tracking-wider text-[10px] rounded-md"
                  title="View Razorpay / Stripe direct checkout blueprint"
                >
                  <Code className="w-4 h-4 text-[#6B452D]" />
                  <span className="hidden sm:inline font-semibold">Gateway Code</span>
                </button>
              </div>

              <p className="text-[10px] text-[#7B6858] text-center uppercase tracking-widest">
                Direct artist consultations: +91 8000917547 (Vishal Baru, Beawar)
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Future-proofing modal for Stripe / Razorpay */}
      <FuturePaymentModal
        painting={painting}
        isOpen={showFuturePayment}
        onClose={() => setShowFuturePayment(false)}
      />
    </>
  );
};
