import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Sparkles, 
  ArrowUpDown, 
  SlidersHorizontal,
  Palette,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Painting, PaintingType, PaintingStatus } from '../types';
import { PaintingCard } from './PaintingCard';

interface GalleryViewProps {
  paintings: Painting[];
  onSelectPainting: (painting: Painting) => void;
  onOpenCommission: () => void;
}

export const GalleryView: React.FC<GalleryViewProps> = ({ 
  paintings, 
  onSelectPainting,
  onOpenCommission
}) => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'newest' | 'price-asc' | 'price-desc'>('featured');

  const artTypes = [
    { id: 'all', label: 'All Artworks' },
    { id: 'Pichwai', label: 'Pichwai Art' },
    { id: 'Sketch', label: 'Realistic Sketches' },
    { id: 'Watercolor', label: 'Watercolors' },
    { id: 'Acrylic', label: 'Acrylic & Oil' },
    { id: 'Rajput Miniature', label: 'Miniature Art' }
  ];

  // Filtering and sorting
  const filteredPaintings = useMemo(() => {
    return paintings
      .filter(painting => {
        const matchesType = selectedType === 'all' || painting.type === selectedType;
        const matchesStatus = 
          selectedStatus === 'all' || 
          painting.status?.trim().toLowerCase() === selectedStatus.trim().toLowerCase();
        const matchesSearch = 
          painting.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          painting.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          painting.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          painting.size.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesType && matchesStatus && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'featured') {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (sortBy === 'newest') {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (sortBy === 'price-asc') {
          return a.price - b.price;
        }
        if (sortBy === 'price-desc') {
          return b.price - a.price;
        }
        return 0;
      });
  }, [paintings, selectedType, selectedStatus, searchQuery, sortBy]);

  const availableCount = paintings.filter(p => p.status?.trim().toLowerCase() === 'available').length;
  const soldCount = paintings.filter(p => p.status?.trim().toLowerCase() === 'sold').length;

  return (
    <div className="space-y-10 pb-16">
      
      {/* Editorial Hero Banner */}
      <section className="relative rounded-2xl bg-[#1A1A1A] text-[#FDFBF7] p-8 sm:p-12 md:p-14 overflow-hidden border border-[#1A1A1A] shadow-xl">
        {/* Background decorative ambient subtle tones */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#5A5A40]/20 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-[#8B0000]/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#2A2A2A] border border-white/15 text-[#EFEBE4] text-[10px] font-semibold uppercase tracking-[0.25em] font-sans-ui">
            <Sparkles className="w-3.5 h-3.5 text-[#DCD6C8]" />
            <span>Beawar • Rajasthan Atelier</span>
          </div>

          <h1 className="font-cinzel text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#FDFBF7] leading-tight">
            Original Artworks & Devotional Masterpieces
          </h1>

          <p className="font-cormorant text-xl sm:text-2xl text-[#D6D0C5] leading-relaxed italic max-w-2xl">
            "Chitrakari ek anokhi kala hai jo imagination ko samne la deta hai." Sacred Pichwai paintings, lifelike graphite portraits, and luminous watercolors by artist Vishal Baru.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href="#gallery-grid"
              className="px-6 py-3 bg-[#FDFBF7] hover:bg-white text-[#1A1A1A] font-semibold text-xs uppercase tracking-[0.2em] font-sans-ui transition-all duration-200 shadow-sm flex items-center gap-2"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <button
              onClick={onOpenCommission}
              className="px-6 py-3 bg-transparent hover:bg-white/10 text-[#FDFBF7] font-medium text-xs uppercase tracking-[0.15em] font-sans-ui border border-white/30 transition-all duration-200"
            >
              Request Custom Commission
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/15 max-w-lg">
            <div>
              <div className="font-cinzel text-xl sm:text-2xl font-bold text-[#FDFBF7]">{paintings.length}</div>
              <div className="text-[10px] uppercase tracking-widest text-[#A8A49A] font-sans-ui">Total Works</div>
            </div>
            <div>
              <div className="font-cinzel text-xl sm:text-2xl font-bold text-emerald-400">{availableCount}</div>
              <div className="text-[10px] uppercase tracking-widest text-[#A8A49A] font-sans-ui">Available</div>
            </div>
            <div>
              <div className="font-cinzel text-xl sm:text-2xl font-bold text-[#DCD6C8]">{soldCount}</div>
              <div className="text-[10px] uppercase tracking-widest text-[#A8A49A] font-sans-ui">Collected</div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter and Search Bar Section */}
      <section id="gallery-grid" className="space-y-6">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-[#F5F2ED] p-4 sm:p-5 rounded-xl border border-[#1A1A1A]/10 shadow-xs">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A1A1A]/40" />
            <input
              type="text"
              value={searchQuery || ''}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, style (Pichwai, Charcoal), size, or theme..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#1A1A1A]/15 bg-white text-xs font-sans-ui focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#1A1A1A]/50 hover:text-[#1A1A1A]"
              >
                Clear
              </button>
            )}
          </div>

          {/* Controls: Status filter & Sort dropdown */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Status Filter */}
            <div className="flex items-center bg-white p-1 rounded-lg border border-[#1A1A1A]/15 text-xs font-sans-ui">
              <button
                onClick={() => setSelectedStatus('all')}
                className={`px-3 py-1.5 rounded-md text-[11px] uppercase tracking-wider font-semibold transition-all ${
                  selectedStatus === 'all' 
                    ? 'bg-[#1A1A1A] text-[#FDFBF7]' 
                    : 'text-[#1A1A1A]/70 hover:text-[#1A1A1A]'
                }`}
              >
                All Status
              </button>
              <button
                onClick={() => setSelectedStatus('available')}
                className={`px-3 py-1.5 rounded-md text-[11px] uppercase tracking-wider font-semibold transition-all flex items-center gap-1.5 ${
                  selectedStatus === 'available' 
                    ? 'bg-[#2F4F4F] text-white' 
                    : 'text-[#1A1A1A]/70 hover:text-[#2F4F4F]'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Available ({availableCount})</span>
              </button>
              <button
                onClick={() => setSelectedStatus('sold')}
                className={`px-3 py-1.5 rounded-md text-[11px] uppercase tracking-wider font-semibold transition-all ${
                  selectedStatus === 'sold' 
                    ? 'bg-[#8B0000] text-white' 
                    : 'text-[#1A1A1A]/70 hover:text-[#8B0000]'
                }`}
              >
                Sold ({soldCount})
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-white border border-[#1A1A1A]/15 rounded-lg px-3 py-2 text-xs font-sans-ui text-[#1A1A1A]">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#1A1A1A]/60" />
              <select
                value={sortBy || 'featured'}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent focus:outline-none cursor-pointer pr-2 text-xs"
              >
                <option value="featured">Featured Curations</option>
                <option value="newest">Recently Added</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>

          </div>
        </div>

        {/* Art Medium Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {artTypes.map(type => {
            const isSelected = selectedType === type.id;
            return (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`px-4 py-2 rounded-lg text-xs uppercase tracking-widest font-sans-ui whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#1A1A1A] text-[#FDFBF7] font-bold shadow-xs'
                    : 'bg-white text-[#1A1A1A]/80 hover:bg-[#F5F2ED] border border-[#1A1A1A]/15'
                }`}
              >
                <Palette className={`w-3.5 h-3.5 ${isSelected ? 'text-[#DCD6C8]' : 'text-[#5A5A40]'}`} />
                <span>{type.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Paintings Grid Showcase */}
      <section>
        {filteredPaintings.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-[#1A1A1A]/10 space-y-4">
            <Palette className="w-12 h-12 text-[#1A1A1A]/30 mx-auto" />
            <h3 className="font-cinzel text-lg font-bold text-[#1A1A1A]">No Artworks Found</h3>
            <p className="text-xs text-[#1A1A1A]/60 max-w-md mx-auto font-sans-ui">
              We couldn't find any paintings matching your current filter criteria. Try changing your search keywords or category filters.
            </p>
            <button
              onClick={() => {
                setSelectedType('all');
                setSelectedStatus('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-[#1A1A1A] text-white text-xs uppercase tracking-widest font-sans-ui font-medium"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-7">
            {filteredPaintings.map((painting) => (
              <PaintingCard
                key={painting.id}
                painting={painting}
                onSelectPainting={onSelectPainting}
              />
            ))}
          </div>
        )}
      </section>

      {/* Commission Callout Footer Strip */}
      <section className="p-8 sm:p-10 rounded-2xl bg-[#F5F2ED] border border-[#1A1A1A]/10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-[#5A5A40] text-[10px] font-bold uppercase tracking-[0.2em] font-sans-ui">
            <Palette className="w-4 h-4" />
            <span>Looking for a Bespoke Custom Size or Motif?</span>
          </div>
          <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-[#1A1A1A]">
            Order a Custom Commission Painting
          </h3>
          <p className="text-xs sm:text-sm text-[#1A1A1A]/70 max-w-xl font-sans-ui leading-relaxed">
            Upload your reference photograph or describe your required Pichwai / portrait dimensions. Vishal Baru will hand-render it to perfection.
          </p>
        </div>

        <button
          onClick={onOpenCommission}
          className="px-6 py-3 bg-[#1A1A1A] hover:bg-[#5A5A40] text-white font-semibold text-xs uppercase tracking-[0.2em] font-sans-ui transition-all shadow-sm shrink-0 flex items-center gap-2"
        >
          <span>Book Custom Order</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>

    </div>
  );
};
