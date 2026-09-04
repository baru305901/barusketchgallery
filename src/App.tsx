/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { GalleryView } from './components/GalleryView';
import { AboutView } from './components/AboutView';
import { BookingInquiryView } from './components/BookingInquiryView';
import { AdminDashboard } from './components/AdminDashboard';
import { PaintingDetailModal } from './components/PaintingDetailModal';
import { Painting, Enquiry } from './types';
import { fetchPaintings, fetchEnquiries } from './lib/store';
import { INITIAL_PAINTINGS, INITIAL_ENQUIRIES } from './data/initialData';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'gallery' | 'about' | 'commission' | 'admin'>('gallery');
  const [paintings, setPaintings] = useState<Painting[]>(INITIAL_PAINTINGS);
  const [enquiries, setEnquiries] = useState<Enquiry[]>(INITIAL_ENQUIRIES);
  const [selectedPainting, setSelectedPainting] = useState<Painting | null>(null);
  const [commissionTargetPainting, setCommissionTargetPainting] = useState<Painting | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load paintings & enquiries on mount
  const loadData = async () => {
    try {
      const [fetchedPaintings, fetchedEnquiries] = await Promise.all([
        fetchPaintings(),
        fetchEnquiries()
      ]);
      setPaintings(fetchedPaintings);
      setEnquiries(fetchedEnquiries);
    } catch (err) {
      console.warn('Error loading store data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // When a user wants to commission a custom variation from the painting detail modal
  const handleInquireCustomPainting = (painting: Painting) => {
    setCommissionTargetPainting(painting);
    setCurrentTab('commission');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F1E7] text-[#2D241E] font-sans-ui antialiased selection:bg-[#6B452D]/20 selection:text-[#2D241E]">
      
      {/* Primary Header & Navigation */}
      <Navbar 
        currentTab={currentTab} 
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main Page Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {currentTab === 'gallery' && (
          <GalleryView 
            paintings={paintings}
            onSelectPainting={(painting) => setSelectedPainting(painting)}
            onOpenCommission={() => {
              setCommissionTargetPainting(null);
              setCurrentTab('commission');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentTab === 'about' && (
          <AboutView 
            onOpenCommission={() => {
              setCommissionTargetPainting(null);
              setCurrentTab('commission');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onBrowseGallery={() => {
              setCurrentTab('gallery');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentTab === 'commission' && (
          <BookingInquiryView 
            paintings={paintings}
            initialPainting={commissionTargetPainting}
            onClearInitialPainting={() => setCommissionTargetPainting(null)}
          />
        )}

        {currentTab === 'admin' && (
          <AdminDashboard 
            paintings={paintings}
            enquiries={enquiries}
            onRefreshData={loadData}
            onExitAdmin={() => setCurrentTab('gallery')}
          />
        )}
      </main>

      {/* Detail Modal for Selected Painting */}
      <PaintingDetailModal 
        painting={selectedPainting}
        isOpen={!!selectedPainting}
        onClose={() => setSelectedPainting(null)}
        onInquireCustom={handleInquireCustomPainting}
      />

      {/* Primary Footer */}
      <Footer 
        onNavigate={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}
