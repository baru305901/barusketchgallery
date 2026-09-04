import React from 'react';
import { Eye, Maximize2, MessageCircle, Images } from 'lucide-react';
import { Painting } from '../types';

export interface PaintingCardProps {
  painting: Painting;
  onSelectPainting: (painting: Painting) => void;
}

export const PaintingCard: React.FC<PaintingCardProps> = ({ painting, onSelectPainting }) => {
  // Case-insensitive status checking so that gallery cards correctly display the AVAILABLE badge
  const isAvailable = painting.status?.trim().toLowerCase() === 'available';

  const primaryImage = painting.image_url || painting.images?.[0] || '';
  const totalPhotos = painting.images && painting.images.length > 0 ? painting.images.length : (primaryImage ? 1 : 0);

  const whatsappOrderLink = `https://wa.me/918000917547?text=${encodeURIComponent(
    `Hi Vishal, I am interested in buying your painting: '${painting.name}' (Size: ${painting.size}, Price: ₹${painting.price.toLocaleString('en-IN')}). Please provide details.`
  )}`;

  return (
    <div 
      id={`painting-card-${painting.id}`}
      className="group bg-white rounded-xl border border-[#1A1A1A]/15 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1"
    >
      {/* Artwork Image Container with gallery framing mat */}
      <div 
        className="relative aspect-4/5 w-full bg-[#1A1A1A] overflow-hidden cursor-pointer"
        onClick={() => onSelectPainting(painting)}
      >
        <img 
          src={primaryImage} 
          alt={painting.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Gradient shadow for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Top Status & Category Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest font-sans-ui bg-white/90 backdrop-blur-md text-[#1A1A1A] shadow-xs">
            {painting.type}
          </span>

          {/* Status Tag: Clearly displays "Available" or "Sold" with Artistic Flair theme badge */}
          {isAvailable ? (
            <span className="available-badge">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 mr-1 animate-pulse"></span>
              Available
            </span>
          ) : (
            <span className="sold-badge">
              Sold
            </span>
          )}
        </div>

        {/* Multiple Photos Badge Indicator */}
        {totalPhotos > 1 && (
          <div className="absolute bottom-3 right-3 pointer-events-none flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-[11px] font-sans-ui font-medium border border-white/20 shadow-sm transition-opacity group-hover:opacity-90">
            <Images className="w-3.5 h-3.5 text-amber-300" />
            <span>{totalPhotos} photos</span>
          </div>
        )}

        {/* Quick View Button on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <span className="px-4 py-2 bg-[#FDFBF7] text-[#1A1A1A] font-semibold text-xs uppercase tracking-widest font-sans-ui shadow-lg flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <Eye className="w-4 h-4 text-[#5A5A40]" />
            <span>Inspect Artwork</span>
          </span>
        </div>
      </div>

      {/* Artwork Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-1.5">
          {/* Artist attribution */}
          <div className="flex items-center justify-between text-[11px] uppercase tracking-wider font-sans-ui text-[#1A1A1A]/60">
            <span>Artist: <strong className="text-[#1A1A1A] font-semibold">Vishal Baru</strong></span>
            <span>{painting.size}</span>
          </div>

          {/* Painting Title */}
          <h3 
            onClick={() => onSelectPainting(painting)}
            className="font-cinzel text-base font-bold text-[#1A1A1A] line-clamp-2 hover:text-[#5A5A40] cursor-pointer transition-colors leading-snug"
            title={painting.name}
          >
            {painting.name}
          </h3>

          <p className="text-xs text-[#1A1A1A]/70 line-clamp-2 font-cormorant text-base italic leading-snug">
            {painting.description}
          </p>
        </div>

        {/* Price and Action Buttons */}
        <div className="pt-3 border-t border-[#1A1A1A]/10 space-y-2.5">
          <div className="flex items-baseline justify-between font-sans-ui">
            <span className="text-[11px] uppercase tracking-widest text-[#1A1A1A]/50">Original Price</span>
            <span className="font-cinzel text-lg font-bold text-[#1A1A1A]">
              ₹{painting.price.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* View Details Button */}
            <button
              id={`view-details-btn-${painting.id}`}
              onClick={() => onSelectPainting(painting)}
              className="w-full py-2 px-3 border border-[#1A1A1A]/20 hover:border-[#1A1A1A] text-[#1A1A1A] font-medium text-xs uppercase tracking-wider font-sans-ui transition-colors flex items-center justify-center gap-1"
            >
              <Maximize2 className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span>Details</span>
            </button>

            {/* WhatsApp Buy Now / Commission Button */}
            {isAvailable ? (
              <a
                id={`buy-whatsapp-btn-${painting.id}`}
                href={whatsappOrderLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-3 bg-[#1A1A1A] hover:bg-[#5A5A40] text-white font-medium text-xs uppercase tracking-wider font-sans-ui transition-all shadow-xs flex items-center justify-center gap-1"
                title="Instant Order on WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Buy Now</span>
              </a>
            ) : (
              <button
                id={`sold-inquire-btn-${painting.id}`}
                onClick={() => onSelectPainting(painting)}
                className="w-full py-2 px-3 bg-[#1A1A1A]/10 hover:bg-[#1A1A1A]/20 text-[#1A1A1A] font-medium text-xs uppercase tracking-wider font-sans-ui transition-colors flex items-center justify-center gap-1"
              >
                <span>Re-create</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
