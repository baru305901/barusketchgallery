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
      
      {/* Editorial Hero Banner - Warm Cream & Beige Luxury Art-Gallery Style */}
      <section className="relative rounded-2xl bg-gradient-to-br from-[#F7F1E7] via-[#F3ECE1] to-[#E9DDCC] text-[#2D241E] p-8 sm:p-12 md:p-14 overflow-hidden border border-[#D6C8B8] shadow-md">
        {/* Background decorative ambient subtle tones */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#A8753F]/15 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-[#6B452D]/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/85 border border-[#D6C8B8] text-[#4A2F1F] text-[10px] font-semibold uppercase tracking-[0.25em] font-sans-ui shadow-xs rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-[#A8753F]" />
            <span>Beawar • Rajasthan Atelier</span>
          </div>

          <h1 className="font-cinzel text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#2D241E] leading-tight">
            <span className="text-[#6B452D]">Original Artworks</span> & Devotional Masterpieces
          </h1>

          <p className="font-cormorant text-xl sm:text-2xl text-[#4A2F1F] leading-relaxed italic max-w-2xl">
            "Chitrakari ek anokhi kala hai jo imagination ko samne la deta hai." Sacred Pichwai paintings, lifelike graphite portraits, and luminous watercolors by artist Vishal Baru.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href="#gallery-grid"
              className="px-6 py-3 bg-[#6B452D] hover:bg-[#4A2F1F] text-[#FFFFFF] font-semibold text-xs uppercase tracking-[0.2em] font-sans-ui transition-all duration-200 shadow-sm flex items-center gap-2 rounded-md"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <button
              onClick={onOpenCommission}
              className="px-6 py-3 bg-transparent hover:bg-[#E9DDCC]/60 text-[#4A2F1F] font-semibold text-xs uppercase tracking-[0.15em] font-sans-ui border-2 border-[#6B452D] transition-all duration-200 rounded-md"
            >
              Request Custom Commission
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#D6C8B8] max-w-lg">
            <div>
              <div className="font-cinzel text-xl sm:text-2xl font-bold text-[#6B452D]">{paintings.length}</div>
              <div className="text-[10px] uppercase tracking-widest text-[#4A2F1F] font-sans-ui font-medium">Total Works</div>
            </div>
            <div>
              <div className="font-cinzel text-xl sm:text-2xl font-bold text-emerald-700">{availableCount}</div>
              <div className="text-[10px] uppercase tracking-widest text-[#4A2F1F] font-sans-ui font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                <span>Available</span>
              </div>
            </div>
            <div>
              <div className="font-cinzel text-xl sm:text-2xl font-bold text-rose-700">{soldCount}</div>
              <div className="text-[10px] uppercase tracking-widest text-[#4A2F1F] font-sans-ui font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                <span>Sold</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter and Search Bar Section */}
      <section id="gallery-grid" className="space-y-6">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-xl border border-[#D6C8B8] shadow-xs">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7B6858]" />
            <input
              type="text"
              value={searchQuery || ''}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, style (Pichwai, Charcoal), size, or theme..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#D6C8B8] bg-white text-xs font-sans-ui text-[#2D241E] placeholder-[#7B6858] focus:outline-none focus:ring-1 focus:ring-[#6B452D] focus:border-[#6B452D] transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#7B6858] hover:text-[#2D241E]"
              >
                Clear
              </button>
            )}
          </div>

          {/* Controls: Status filter & Sort dropdown */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Status Filter */}
            <div className="flex items-center bg-[#F7F1E7] p-1 rounded-lg border border-[#D6C8B8] text-xs font-sans-ui">
              <button
                onClick={() => setSelectedStatus('all')}
                className={`px-3 py-1.5 rounded-md text-[11px] uppercase tracking-wider font-semibold transition-all ${
                  selectedStatus === 'all' 
                    ? 'bg-[#6B452D] text-[#FFFFFF] shadow-xs' 
                    : 'text-[#4A2F1F] hover:bg-[#E9DDCC]'
                }`}
              >
                All Status
              </button>
              <button
                onClick={() => setSelectedStatus('available')}
                className={`px-3 py-1.5 rounded-md text-[11px] uppercase tracking-wider font-semibold transition-all flex items-center gap-1.5 ${
                  selectedStatus === 'available' 
                    ? 'bg-emerald-600 text-white shadow-xs border border-emerald-500 font-bold' 
                    : 'text-[#4A2F1F] hover:bg-[#E9DDCC]'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${selectedStatus === 'available' ? 'bg-white animate-pulse' : 'bg-emerald-600'}`}></span>
                <span>Available ({availableCount})</span>
              </button>
              <button
                onClick={() => setSelectedStatus('sold')}
                className={`px-3 py-1.5 rounded-md text-[11px] uppercase tracking-wider font-semibold transition-all flex items-center gap-1.5 ${
                  selectedStatus === 'sold' 
                    ? 'bg-[#d60808] text-white shadow-xs border border-red-600 font-bold' 
                    : 'text-[#4A2F1F] hover:bg-[#E9DDCC]'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${selectedStatus === 'sold' ? 'bg-white' : 'bg-[#d60808]'}`}></span>
                <span>Sold ({soldCount})</span>
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-white border border-[#D6C8B8] rounded-lg px-3 py-2 text-xs font-sans-ui text-[#2D241E]">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#7B6858]" />
              <select
                value={sortBy || 'featured'}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent focus:outline-none cursor-pointer pr-2 text-xs text-[#2D241E]"
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
                    ? 'bg-[#4A2F1F] text-[#FFFFFF] font-bold shadow-xs border border-[#4A2F1F]'
                    : 'bg-white text-[#4A2F1F] hover:bg-[#E9DDCC] border border-[#D6C8B8]'
                }`}
              >
                <Palette className={`w-3.5 h-3.5 ${isSelected ? 'text-[#E9DDCC]' : 'text-[#A8753F]'}`} />
                <span>{type.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Paintings Grid Showcase */}
      <section>
        {filteredPaintings.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-[#D6C8B8] space-y-4 shadow-xs">
            <Palette className="w-12 h-12 text-[#7B6858] mx-auto" />
            <h3 className="font-cinzel text-lg font-bold text-[#2D241E]">No Artworks Found</h3>
            <p className="text-xs text-[#4A2F1F] max-w-md mx-auto font-sans-ui">
              We couldn't find any paintings matching your current filter criteria. Try changing your search keywords or category filters.
            </p>
            <button
              onClick={() => {
                setSelectedType('all');
                setSelectedStatus('all');
                setSearchQuery('');
              }}
              className="px-5 py-2.5 bg-[#6B452D] hover:bg-[#4A2F1F] text-white text-xs uppercase tracking-widest font-sans-ui font-semibold rounded-md shadow-xs transition-colors"
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
      <section className="p-8 sm:p-10 rounded-2xl bg-gradient-to-r from-[#E9DDCC] via-[#F4ECE0] to-[#F7F1E7] border border-[#D6C8B8] flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-[#6B452D] text-[10px] font-bold uppercase tracking-[0.2em] font-sans-ui">
            <Palette className="w-4 h-4 text-[#A8753F]" />
            <span>Looking for a Bespoke Custom Size or Motif?</span>
          </div>
          <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-[#2D241E]">
            Order a Custom Commission Painting
          </h3>
          <p className="text-xs sm:text-sm text-[#4A2F1F] max-w-xl font-sans-ui leading-relaxed">
            Upload your reference photograph or describe your required Pichwai / portrait dimensions. Vishal Baru will hand-render it to perfection.
          </p>
        </div>

        <button
          onClick={onOpenCommission}
          className="px-6 py-3 bg-[#6B452D] hover:bg-[#4A2F1F] text-white font-semibold text-xs uppercase tracking-[0.2em] font-sans-ui transition-all shadow-sm shrink-0 flex items-center gap-2 rounded-md"
        >
          <span>Book Custom Order</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>

    </div>
  );
};
