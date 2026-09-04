import React, { useState, useRef } from 'react';
import { 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  Database, 
  FileText, 
  Phone, 
  Mail, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Sparkles, 
  Download, 
  Copy, 
  ExternalLink, 
  LogOut, 
  Lock, 
  Key, 
  Layers, 
  Palette, 
  TrendingUp, 
  DollarSign, 
  X, 
  Upload, 
  Check, 
  Filter, 
  RefreshCw,
  MessageCircle,
  Code,
  Star,
  Images
} from 'lucide-react';
import { Painting, Enquiry, PaintingType, PaintingStatus, EnquiryStatus } from '../types';
import { 
  savePainting, 
  deletePaintingById, 
  togglePaintingStatus, 
  updateEnquiryStatus, 
  resetToInitialGallery 
} from '../lib/store';
import { 
  setSupabaseCredentials, 
  getSupabase,
  isValidSupabaseUrl,
  uploadImageToSupabase,
  DEFAULT_SUPABASE_URL,
  DEFAULT_SUPABASE_ANON_KEY
} from '../lib/supabaseClient';

interface AdminDashboardProps {
  paintings: Painting[];
  enquiries: Enquiry[];
  onRefreshData: () => Promise<void>;
  onExitAdmin: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  paintings,
  enquiries,
  onRefreshData,
  onExitAdmin
}) => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('baru_admin_auth') === 'true';
  });
  const [authEmail, setAuthEmail] = useState('sketchartis007@gmail.com');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Active Admin Sub-tab
  const [activeSection, setActiveSection] = useState<'overview' | 'paintings' | 'enquiries' | 'supabase_sql' | 'settings'>('overview');

  // Painting CRUD Form Modal State
  const [isPaintingModalOpen, setIsPaintingModalOpen] = useState(false);
  const [editingPainting, setEditingPainting] = useState<Painting | null>(null);
  
  // Painting Form Fields
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formSize, setFormSize] = useState('');
  const [formPrice, setFormPrice] = useState<number>(15000);
  const [formType, setFormType] = useState<PaintingType>('Pichwai');
  const [formStatus, setFormStatus] = useState<PaintingStatus>('available');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formImages, setFormImages] = useState<string[]>([]);
  const [newImageUrlInput, setNewImageUrlInput] = useState('');
  const [formMediumDetails, setFormMediumDetails] = useState('');
  const [formYear, setFormYear] = useState<number>(new Date().getFullYear());
  const [formFeatured, setFormFeatured] = useState<boolean>(false);
  const [isSubmittingPainting, setIsSubmittingPainting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [formErrorMessage, setFormErrorMessage] = useState('');

  // Enquiry filters & detail viewer
  const [enquiryFilter, setEnquiryFilter] = useState<'all' | 'new' | 'contacted' | 'closed'>('all');
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [previewReferenceImage, setPreviewReferenceImage] = useState<string | null>(null);

  // Supabase connection state
  const [supabaseUrlInput, setSupabaseUrlInput] = useState(() => localStorage.getItem('baru_supabase_url') || DEFAULT_SUPABASE_URL || '');
  const [supabaseKeyInput, setSupabaseKeyInput] = useState(() => localStorage.getItem('baru_supabase_key') || DEFAULT_SUPABASE_ANON_KEY || '');
  const [isSeedingSupabase, setIsSeedingSupabase] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  const paintingFileInputRef = useRef<HTMLInputElement>(null);

  // Handle Login Authentication
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    const cleanInputEmail = authEmail.trim().toLowerCase();
    const cleanInputPassword = authPassword.trim();
    const targetEmail = 'sketchartis007@gmail.com';
    const validPasscodes = ['baru7547', 'admin123', '305901'];

    // 1. Strict Email Verification
    if (cleanInputEmail !== targetEmail) {
      setAuthError('Unauthorized Admin Email address.');
      return;
    }

    // 2. Strict Passcode Verification
    if (!cleanInputPassword || !validPasscodes.includes(cleanInputPassword)) {
      setAuthError('Invalid Admin Passcode.');
      return;
    }

    setIsAuthenticated(true);
    localStorage.setItem('baru_admin_auth', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('baru_admin_auth');
  };

  // Open modal to add a new painting
  const handleOpenAddPainting = () => {
    setEditingPainting(null);
    setFormErrorMessage('');
    setFormName('');
    setFormDescription('');
    setFormSize('24 x 36 inches');
    setFormPrice(18000);
    setFormType('Pichwai');
    setFormStatus('available');
    const defaultSample = 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=80';
    setFormImageUrl(defaultSample);
    setFormImages([defaultSample]);
    setNewImageUrlInput('');
    setFormMediumDetails('Natural Stone Pigments & Gold Leaf on Fabric');
    setFormYear(new Date().getFullYear());
    setFormFeatured(false);
    setIsPaintingModalOpen(true);
  };

  // Open modal to edit existing painting
  const handleOpenEditPainting = (painting: Painting) => {
    setEditingPainting(painting);
    setFormErrorMessage('');
    setFormName(painting.name || '');
    setFormDescription(painting.description || '');
    setFormSize(painting.size || '');
    setFormPrice(painting.price ?? 0);
    setFormType(painting.type || 'Pichwai');
    setFormStatus(painting.status || 'available');
    
    // Normalize existing images list
    const existingImages = Array.isArray(painting.images) && painting.images.length > 0
      ? painting.images.filter(img => typeof img === 'string' && img.trim().length > 0)
      : (painting.image_url?.trim() ? [painting.image_url.trim()] : []);
    
    const primaryImg = painting.image_url?.trim() || existingImages[0] || '';
    setFormImages(existingImages);
    setFormImageUrl(primaryImg);
    setNewImageUrlInput('');
    setFormMediumDetails(painting.medium_details || '');
    setFormYear(painting.year || new Date().getFullYear());
    setFormFeatured(Boolean(painting.featured));
    setIsPaintingModalOpen(true);
  };

  // Set selected photo as primary cover image
  const handleSetPrimaryImage = (url: string) => {
    setFormImageUrl(url);
  };

  // Remove a photo from uploaded images
  const handleRemoveImage = (urlToRemove: string) => {
    setFormImages(prev => {
      const remaining = prev.filter(u => u !== urlToRemove);
      if (formImageUrl === urlToRemove) {
        setFormImageUrl(remaining[0] || '');
      }
      return remaining;
    });
  };

  // Add an image from URL input
  const handleAddImageUrl = () => {
    const trimmed = newImageUrlInput.trim();
    if (!trimmed) return;
    setFormImages(prev => {
      if (prev.includes(trimmed)) return prev;
      const next = [...prev, trimmed];
      if (!formImageUrl) {
        setFormImageUrl(trimmed);
      }
      return next;
    });
    setNewImageUrlInput('');
  };

  // Handle local painting image file upload with Supabase storage upload & FileReader fallback (Supports multiple files)
  const handlePaintingImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles: File[] = Array.from(e.target.files);
      setIsUploadingImage(true);
      setFormErrorMessage('');

      // Helper to read file to base64 Data URL
      const readAsBase64 = (fileToRead: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (evt) => resolve(evt.target?.result as string);
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(fileToRead);
        });
      };

      try {
        console.log(`[Painting Image Upload] Selected ${selectedFiles.length} file(s) for upload.`);
        const supabase = getSupabase();
        const uploadedUrls: string[] = [];

        for (const file of selectedFiles) {
          console.log('[Painting Image Upload] Uploading file:', file.name, `(${Math.round(file.size / 1024)} KB)`);
          let targetImageUrl: string | null = null;

          // Attempt Supabase storage upload if client is available
          if (supabase) {
            try {
              const uploadedUrl = await uploadImageToSupabase(file, 'painting-images');
              if (uploadedUrl) {
                console.log('[Painting Image Upload] Supabase storage upload success:', uploadedUrl);
                targetImageUrl = uploadedUrl;
              } else {
                console.warn('[Painting Image Upload] Supabase storage returned null. Falling back to base64 Data URL.');
              }
            } catch (storageErr) {
              console.warn('[Painting Image Upload] Supabase storage upload failed with notice:', storageErr);
            }
          }

          // If storage upload was skipped, returned null, or failed, fall back to base64 Data URL directly
          if (!targetImageUrl) {
            targetImageUrl = await readAsBase64(file);
            console.log('[Painting Image Upload] Converted image to local Data URL.');
          }

          if (targetImageUrl) {
            uploadedUrls.push(targetImageUrl);
          }
        }

        if (uploadedUrls.length > 0) {
          setFormImages(prev => {
            const nextList = [...prev];
            for (const u of uploadedUrls) {
              if (!nextList.includes(u)) {
                nextList.push(u);
              }
            }
            if (!formImageUrl && nextList.length > 0) {
              setFormImageUrl(nextList[0]);
            }
            return nextList;
          });
        }
      } catch (uploadErr) {
        console.error('[Painting Multiple Upload Error]:', uploadErr);
        setFormErrorMessage('Failed to process some uploaded image files.');
      } finally {
        setIsUploadingImage(false);
        if (paintingFileInputRef.current) {
          paintingFileInputRef.current.value = '';
        }
      }
    }
  };

  // Save painting (Create or Edit) with robust validation, console error logging, and Supabase fallback
  const handleSavePaintingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrorMessage('');

    const primaryCoverUrl = formImageUrl.trim() || formImages[0] || '';
    const finalImagesList = formImages.length > 0 ? formImages : (primaryCoverUrl ? [primaryCoverUrl] : []);

    console.log('[Publish Painting] Form submission triggered with parameters:', {
      action: editingPainting ? 'UPDATE' : 'CREATE',
      id: editingPainting?.id,
      name: formName,
      description: formDescription,
      size: formSize,
      price: formPrice,
      type: formType,
      status: formStatus,
      primaryCoverUrl: primaryCoverUrl ? (primaryCoverUrl.startsWith('data:') ? `data:image... (${primaryCoverUrl.length} bytes)` : primaryCoverUrl) : '(none)',
      totalImages: finalImagesList.length,
      mediumDetails: formMediumDetails,
      year: formYear,
      featured: formFeatured
    });

    // Validate inputs
    const errors: string[] = [];
    if (!formName.trim()) {
      errors.push('Painting Title is required.');
    }
    if (!formSize.trim()) {
      errors.push('Dimensions (Size) is required (e.g., "24 x 36 inches").');
    }
    if (!primaryCoverUrl && finalImagesList.length === 0) {
      errors.push('At least one artwork photo or image is required.');
    }
    if (isNaN(Number(formPrice)) || Number(formPrice) < 0) {
      errors.push('Please enter a valid price in INR (₹).');
    }

    if (errors.length > 0) {
      console.error('[Publish Painting Failed Validation]:', errors);
      setFormErrorMessage(errors.join(' '));
      return;
    }

    setIsSubmittingPainting(true);

    try {
      const payload = {
        id: editingPainting?.id,
        name: formName.trim(),
        description: formDescription.trim(),
        size: formSize.trim(),
        price: Number(formPrice),
        type: formType,
        status: formStatus,
        image_url: primaryCoverUrl,
        images: finalImagesList,
        medium_details: formMediumDetails.trim(),
        year: Number(formYear) || new Date().getFullYear(),
        featured: Boolean(formFeatured)
      };

      console.log('[Publish Painting] Dispatching savePainting payload:', payload);
      const savedPainting = await savePainting(payload);
      console.log('[Publish Painting] savePainting returned successfully:', savedPainting);

      await onRefreshData();
      setIsPaintingModalOpen(false);
      setSaveSuccessMsg(editingPainting ? `Artwork "${formName.trim()}" updated successfully!` : `New artwork "${formName.trim()}" published to gallery!`);
      setTimeout(() => setSaveSuccessMsg(''), 3500);
    } catch (err: any) {
      console.error('[Publish Painting Unexpected Error]:', err);
      const errDetail = err?.message || 'Database operation failed. Check Supabase RLS policies and table schema.';
      setFormErrorMessage(errDetail);
    } finally {
      setIsSubmittingPainting(false);
    }
  };

  // Delete painting
  const handleDeletePainting = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to permanently delete "${name}" from the gallery?`)) {
      try {
        await deletePaintingById(id);
        await onRefreshData();
        setSaveSuccessMsg(`Artwork "${name}" removed from gallery.`);
        setTimeout(() => setSaveSuccessMsg(''), 3000);
      } catch (err: any) {
        console.error('[Delete Painting Error]:', err);
        alert(`Failed to delete artwork: ${err?.message || 'Check Supabase RLS policies.'}`);
      }
    }
  };

  // Toggle Available / Sold Status
  const handleToggleStatus = async (painting: Painting) => {
    const isCurrentlyAvailable = (painting.status || '').trim().toLowerCase() === 'available';
    const nextStatus: PaintingStatus = isCurrentlyAvailable ? 'sold' : 'available';
    try {
      await togglePaintingStatus(painting.id, nextStatus);
      await onRefreshData();
    } catch (err: any) {
      console.error('[Toggle Status Error]:', err);
      alert(`Failed to update status: ${err?.message || 'Check Supabase RLS policies.'}`);
    }
  };

  // Update Enquiry Status
  const handleEnquiryStatusChange = async (id: string, newStatus: EnquiryStatus) => {
    await updateEnquiryStatus(id, newStatus);
    await onRefreshData();
    if (selectedEnquiry && selectedEnquiry.id === id) {
      setSelectedEnquiry({ ...selectedEnquiry, status: newStatus });
    }
  };

  // Save Supabase credentials
  const handleSaveSupabaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const url = supabaseUrlInput.trim();
    const key = supabaseKeyInput.trim();

    if (url && !isValidSupabaseUrl(url)) {
      alert('Please enter a valid HTTP/HTTPS Supabase URL (e.g. https://your-project.supabase.co)');
      return;
    }

    const success = setSupabaseCredentials(url, key);
    if (success || (!url && !key)) {
      setSaveSuccessMsg('Supabase connected! Live database synchronization active.');
    } else {
      setSaveSuccessMsg('Credentials saved and fallback project active.');
    }
    setTimeout(() => setSaveSuccessMsg(''), 3500);
  };

  const handleResetToDefaultSupabase = () => {
    setSupabaseUrlInput(DEFAULT_SUPABASE_URL);
    setSupabaseKeyInput(DEFAULT_SUPABASE_ANON_KEY);
    setSupabaseCredentials(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY);
    setSaveSuccessMsg('Reset to connected project credentials (https://lnpjssonfwpybetvumrj.supabase.co)!');
    setTimeout(() => setSaveSuccessMsg(''), 3500);
  };

  // Seed / Push local gallery items to Supabase paintings table
  const handleSeedPaintingsToSupabase = async () => {
    const supabase = getSupabase();
    if (!supabase) {
      alert('Please ensure Supabase credentials are saved first.');
      return;
    }

    setIsSeedingSupabase(true);
    try {
      // Map paintings ensuring clean structure
      const records = paintings.map(p => ({
        id: p.id.includes('-') && p.id.length >= 32 ? p.id : undefined,
        name: p.name,
        description: p.description,
        size: p.size,
        price: p.price,
        type: p.type,
        status: p.status,
        image_url: p.image_url,
        medium_details: p.medium_details || null,
        year: p.year || 2024,
        featured: Boolean(p.featured)
      }));

      const { error } = await supabase.from('paintings').upsert(records, { onConflict: 'id' });
      if (error) {
        console.warn('Supabase upsert notice:', error.message);
        alert(`Supabase Response: ${error.message}. (Make sure you executed the SQL schema in your Supabase SQL Editor first)`);
      } else {
        setSaveSuccessMsg('Successfully synced paintings to Supabase!');
        await onRefreshData();
        setTimeout(() => setSaveSuccessMsg(''), 3500);
      }
    } catch (err: any) {
      console.error('Seed error:', err);
      alert('Failed to sync to Supabase. Check console for details.');
    } finally {
      setIsSeedingSupabase(false);
    }
  };

  // Calculations for Metrics Dashboard
  const totalPaintings = paintings.length;
  const availablePaintings = paintings.filter(p => (p.status || '').trim().toLowerCase() === 'available').length;
  const soldPaintings = paintings.filter(p => (p.status || '').trim().toLowerCase() === 'sold').length;
  const totalEnquiries = enquiries.length;
  const newEnquiries = enquiries.filter(e => (e.status || '').trim().toLowerCase() === 'new').length;
  const totalInventoryValue = paintings
    .filter(p => (p.status || '').trim().toLowerCase() === 'available')
    .reduce((sum, p) => sum + p.price, 0);

  const filteredEnquiries = enquiries.filter(e => {
    if (enquiryFilter === 'all') return true;
    return e.status === enquiryFilter;
  });

  // If Not Authenticated, Show Protected Login Screen
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-3xl border border-[#E8DFC8] shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#2C241D] text-[#E2B774] flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="font-cinzel text-2xl font-bold text-[#2C241D]">
            Artist Control Panel
          </h2>
          <p className="text-xs text-[#7A6A5C]">
            Protected route for artist Vishal Baru to manage gallery catalog, commission leads, and Supabase database.
          </p>
        </div>

        {authError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-600">
              Artist Email
            </label>
            <input
              type="email"
              required
              value={authEmail}
              onChange={(e) => setAuthEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-[#8C531B] focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600">
                Password / Passcode
              </label>
              <span className="text-[11px] text-[#8C531B] font-mono"></span>
            </div>
            <input
              type="password"
              required
              placeholder="Enter passcode"
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-[#8C531B] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#8C531B] hover:bg-[#734314] text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Key className="w-4 h-4" />
            <span>Sign In to C-Panel</span>
          </button>
        </form>

        <div className="pt-4 border-t border-stone-200 text-center">
          <button
            onClick={onExitAdmin}
            className="text-xs text-stone-500 hover:text-stone-800"
          >
            ← Return to Public Gallery
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      
      {/* Toast Notification Banner */}
      {saveSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-700 text-white text-sm font-medium flex items-center justify-between shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{saveSuccessMsg}</span>
          </div>
          <button onClick={() => setSaveSuccessMsg('')} className="p-1 hover:bg-emerald-800 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="bg-[#2C241D] text-[#FAF6ED] p-6 sm:p-8 rounded-3xl border border-[#483B2E] shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8C531B]/30 text-[#E2B774] text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Artist Control Panel (C-Panel)</span>
          </div>
          <h1 className="font-cinzel text-2xl sm:text-3xl font-bold text-[#FDF6E2]">
            Baru Sketch Gallery Studio Management
          </h1>
          <p className="text-xs text-stone-300 mt-1">
            Logged in as <strong>Vishal Baru</strong> (sketchartis007@gmail.com) • Masuda Road, Beawar 305901
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleOpenAddPainting}
            className="px-4 py-2.5 rounded-xl bg-[#C88A3B] hover:bg-[#B3772C] text-[#1F1913] font-semibold text-xs transition-all shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Painting</span>
          </button>

          <button
            onClick={onRefreshData}
            className="p-2.5 rounded-xl bg-[#3A2F25] hover:bg-[#4D3F33] text-stone-300 hover:text-white border border-[#5E4D3E] transition-colors"
            title="Refresh database records"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleLogout}
            className="px-3.5 py-2.5 rounded-xl bg-[#3A2F25] hover:bg-rose-900/60 text-stone-300 hover:text-rose-200 border border-[#5E4D3E] text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center border-b border-[#E8DFC8] bg-white p-2 rounded-2xl gap-2 shadow-xs overflow-x-auto">
        <button
          onClick={() => setActiveSection('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
            activeSection === 'overview'
              ? 'bg-[#2C241D] text-[#FAF6ED]'
              : 'text-[#6B5E51] hover:bg-stone-100'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-[#C88A3B]" />
          <span>Dashboard Overview</span>
        </button>

        <button
          onClick={() => setActiveSection('paintings')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
            activeSection === 'paintings'
              ? 'bg-[#2C241D] text-[#FAF6ED]'
              : 'text-[#6B5E51] hover:bg-stone-100'
          }`}
        >
          <Palette className="w-4 h-4 text-[#C88A3B]" />
          <span>Manage Paintings ({paintings.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('enquiries')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 relative ${
            activeSection === 'enquiries'
              ? 'bg-[#2C241D] text-[#FAF6ED]'
              : 'text-[#6B5E51] hover:bg-stone-100'
          }`}
        >
          <FileText className="w-4 h-4 text-[#C88A3B]" />
          <span>View Enquiries ({enquiries.length})</span>
          {newEnquiries > 0 && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          )}
        </button>

        <button
          onClick={() => setActiveSection('supabase_sql')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
            activeSection === 'supabase_sql'
              ? 'bg-[#2C241D] text-[#FAF6ED]'
              : 'text-[#6B5E51] hover:bg-stone-100'
          }`}
        >
          <Database className="w-4 h-4 text-[#C88A3B]" />
          <span>Supabase Connection</span>
        </button>
      </div>

      {/* SECTION 1: DASHBOARD OVERVIEW */}
      {activeSection === 'overview' && (
        <div className="space-y-8">
          
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <div className="p-5 rounded-2xl bg-white border border-[#E8DFC8] shadow-xs space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-stone-500">Total Paintings</div>
              <div className="font-cinzel text-3xl font-bold text-[#2C241D]">{totalPaintings}</div>
              <div className="text-[11px] text-stone-500">Original Catalog listings</div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#E8DFC8] shadow-xs space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">Available to Buy</div>
              <div className="font-cinzel text-3xl font-bold text-emerald-700">{availablePaintings}</div>
              <div className="text-[11px] text-stone-500">Ready for instant dispatch</div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#E8DFC8] shadow-xs space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-700">Sold / Private Collection</div>
              <div className="font-cinzel text-3xl font-bold text-amber-700">{soldPaintings}</div>
              <div className="text-[11px] text-stone-500">Successfully acquired</div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#E8DFC8] shadow-xs space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-700">New Commission Leads</div>
              <div className="font-cinzel text-3xl font-bold text-indigo-700">{newEnquiries}</div>
              <div className="text-[11px] text-stone-500">Total inquiries: {totalEnquiries}</div>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Recent Enquiries Card */}
            <div className="p-6 rounded-3xl bg-white border border-[#E8DFC8] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-cinzel text-base font-bold text-[#2C241D]">
                  Latest Commission Enquiries
                </h3>
                <button
                  onClick={() => setActiveSection('enquiries')}
                  className="text-xs text-[#8C531B] font-semibold hover:underline"
                >
                  View All ({enquiries.length}) →
                </button>
              </div>

              {enquiries.length === 0 ? (
                <p className="text-xs text-stone-500 py-4">No enquiries received yet.</p>
              ) : (
                <div className="space-y-3">
                  {enquiries.slice(0, 3).map(enq => (
                    <div key={enq.id} className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-bold text-[#2C241D]">{enq.client_name}</div>
                        <div className="text-xs text-[#8C531B] font-medium">{enq.subject}</div>
                        <div className="text-xs text-stone-500 line-clamp-1 mt-0.5">{enq.message}</div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        enq.status === 'new' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : enq.status === 'contacted'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-stone-200 text-stone-700'
                      }`}>
                        {enq.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Painting Management Card */}
            <div className="p-6 rounded-3xl bg-white border border-[#E8DFC8] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-cinzel text-base font-bold text-[#2C241D]">
                  Gallery Inventory Quick Actions
                </h3>
                <button
                  onClick={handleOpenAddPainting}
                  className="text-xs text-[#8C531B] font-semibold hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Painting</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF6EE] border border-[#E8DFC8] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-600">Active Gallery Inventory Valuation:</span>
                  <span className="font-cinzel font-bold text-[#8C531B] text-base">₹{totalInventoryValue.toLocaleString('en-IN')}</span>
                </div>
                <div className="text-xs text-stone-500 leading-relaxed">
                  You can toggle painting availability between <strong>"Available"</strong> and <strong>"Sold"</strong> with a single click in the Manage Paintings table.
                </div>
                <button
                  onClick={() => setActiveSection('paintings')}
                  className="w-full py-2 rounded-xl bg-[#2C241D] text-white text-xs font-semibold hover:bg-stone-800 transition-colors"
                >
                  Manage Paintings Table
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* SECTION 2: MANAGE PAINTINGS CRUD TABLE */}
      {activeSection === 'paintings' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-cinzel text-xl font-bold text-[#2C241D]">
                Manage Paintings & Catalog
              </h2>
              <p className="text-xs text-stone-500">
                Add, edit prices, descriptions, update images, and toggle Available/Sold statuses.
              </p>
            </div>

            <button
              onClick={handleOpenAddPainting}
              className="px-4 py-2.5 rounded-xl bg-[#8C531B] hover:bg-[#734314] text-white text-xs font-semibold flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Painting</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-[#E8DFC8] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-[#FAF6EE] text-[#2C241D] border-b border-[#E8DFC8] font-cinzel uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Artwork</th>
                    <th className="py-3.5 px-4">Medium / Type</th>
                    <th className="py-3.5 px-4">Size</th>
                    <th className="py-3.5 px-4">Price (₹)</th>
                    <th className="py-3.5 px-4">Current Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {paintings.map((painting) => {
                    const isAvailable = (painting.status || '').trim().toLowerCase() === 'available';
                    return (
                      <tr key={painting.id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="relative shrink-0">
                              <img
                                src={painting.image_url || painting.images?.[0]}
                                alt={painting.name}
                                className="w-12 h-12 rounded-lg object-cover border border-stone-200"
                              />
                              {(painting.images?.length || 0) > 1 && (
                                <span className="absolute -bottom-1 -right-1 bg-stone-900 text-amber-300 text-[9px] px-1 rounded font-bold border border-white">
                                  {painting.images?.length}
                                </span>
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-stone-900 line-clamp-1">{painting.name}</div>
                              <div className="text-[11px] text-stone-500 flex items-center gap-1.5 flex-wrap">
                                <span>Artist: Vishal Baru</span>
                                {(painting.images?.length || 0) > 1 && (
                                  <span className="text-[#8C531B] font-semibold flex items-center gap-0.5">
                                    <Images className="w-3 h-3" />
                                    <span>{painting.images?.length} photos</span>
                                  </span>
                                )}
                                {painting.featured && <span className="text-amber-600 font-medium">• ⭐ Featured</span>}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="px-2.5 py-1 rounded-md bg-stone-100 text-stone-800 font-medium">
                            {painting.type}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-mono">{painting.size}</td>

                        <td className="py-3 px-4 font-cinzel font-bold text-[#8C531B] text-sm">
                          ₹{painting.price.toLocaleString('en-IN')}
                        </td>

                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleToggleStatus(painting)}
                            className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                              isAvailable
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                            }`}
                            title="Click to toggle status"
                          >
                            <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-600' : 'bg-stone-600'}`}></span>
                            <span>{isAvailable ? 'Available' : 'Sold'}</span>
                          </button>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditPainting(painting)}
                              className="p-1.5 rounded-lg text-stone-600 hover:text-[#8C531B] hover:bg-amber-50"
                              title="Edit painting details"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeletePainting(painting.id, painting.name)}
                              className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50"
                              title="Delete painting"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: VIEW ENQUIRIES & REFERENCE IMAGES */}
      {activeSection === 'enquiries' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-cinzel text-xl font-bold text-[#2C241D]">
                Commission Orders & Enquiries
              </h2>
              <p className="text-xs text-stone-500">
                View client contact details, download reference photos, and update fulfillment status.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center bg-stone-100 p-1 rounded-xl text-xs">
              <button
                onClick={() => setEnquiryFilter('all')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  enquiryFilter === 'all' ? 'bg-white text-[#2C241D] shadow-xs' : 'text-stone-600'
                }`}
              >
                All ({enquiries.length})
              </button>
              <button
                onClick={() => setEnquiryFilter('new')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  enquiryFilter === 'new' ? 'bg-emerald-600 text-white shadow-xs' : 'text-stone-600'
                }`}
              >
                New ({newEnquiries})
              </button>
              <button
                onClick={() => setEnquiryFilter('contacted')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  enquiryFilter === 'contacted' ? 'bg-amber-600 text-white shadow-xs' : 'text-stone-600'
                }`}
              >
                Contacted
              </button>
              <button
                onClick={() => setEnquiryFilter('closed')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  enquiryFilter === 'closed' ? 'bg-stone-700 text-white shadow-xs' : 'text-stone-600'
                }`}
              >
                Closed
              </button>
            </div>
          </div>

          {filteredEnquiries.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-[#E8DFC8] space-y-2">
              <FileText className="w-10 h-10 text-stone-400 mx-auto" />
              <div className="font-cinzel text-base font-bold text-[#2C241D]">No Inquiries Found</div>
              <p className="text-xs text-stone-500">No customer messages under the selected filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {filteredEnquiries.map((enq) => (
                <div 
                  key={enq.id}
                  className="bg-white rounded-2xl p-5 border border-[#E8DFC8] shadow-xs space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-base font-bold text-[#2C241D]">{enq.client_name}</div>
                        <div className="text-xs font-semibold text-[#8C531B]">{enq.subject}</div>
                        <div className="text-[11px] text-stone-400 mt-0.5">
                          {new Date(enq.created_at).toLocaleString()}
                        </div>
                      </div>

                      {/* Status Dropdown */}
                      <select
                        value={enq.status}
                        onChange={(e) => handleEnquiryStatusChange(enq.id, e.target.value as EnquiryStatus)}
                        className={`text-xs font-bold px-3 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                          enq.status === 'new'
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                            : enq.status === 'contacted'
                            ? 'bg-amber-50 border-amber-300 text-amber-800'
                            : 'bg-stone-100 border-stone-300 text-stone-700'
                        }`}
                      >
                        <option value="new">Status: New</option>
                        <option value="contacted">Status: Contacted</option>
                        <option value="closed">Status: Closed</option>
                      </select>
                    </div>

                    {/* Client Contacts */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-stone-600 bg-stone-50 p-2.5 rounded-xl">
                      <a href={`mailto:${enq.client_email}`} className="flex items-center gap-1 hover:text-[#8C531B]">
                        <Mail className="w-3.5 h-3.5 text-[#8C531B]" />
                        <span>{enq.client_email}</span>
                      </a>
                      {enq.client_phone && (
                        <a 
                          href={`https://wa.me/${enq.client_phone.replace(/\D/g, '')}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-emerald-700 font-medium hover:underline"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>{enq.client_phone}</span>
                        </a>
                      )}
                    </div>

                    {/* Message */}
                    <div className="text-xs text-stone-700 leading-relaxed bg-[#FAF6EE] p-3 rounded-xl">
                      "{enq.message}"
                    </div>

                    {/* Reference photo preview if client uploaded */}
                    {enq.reference_image_url && (
                      <div className="space-y-1.5 pt-1">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center justify-between">
                          <span>Client Uploaded Reference Photo</span>
                          <button
                            onClick={() => setPreviewReferenceImage(enq.reference_image_url!)}
                            className="text-[#8C531B] hover:underline normal-case font-medium flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View Full Resolution</span>
                          </button>
                        </div>

                        <div 
                          onClick={() => setPreviewReferenceImage(enq.reference_image_url!)}
                          className="relative h-28 rounded-xl overflow-hidden bg-stone-900 border border-stone-200 cursor-pointer group"
                        >
                          <img
                            src={enq.reference_image_url}
                            alt="Client Reference"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1">
                            <Eye className="w-4 h-4" />
                            <span>Inspect Reference</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-[10px] text-stone-400 font-mono">ID: {enq.id}</span>
                    
                    {enq.client_phone && (
                      <a
                        href={`https://wa.me/${enq.client_phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                          `Namaste ${enq.client_name}, this is artist Vishal Baru from Baru Sketch Gallery regarding your inquiry on "${enq.subject}".`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Reply on WhatsApp</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 4: SUPABASE CONNECTION SETUP */}
      {activeSection === 'supabase_sql' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-cinzel text-xl font-bold text-[#2C241D]">
                Supabase Database Connection
              </h2>
              <p className="text-xs text-stone-500">
                Manage your live Supabase database and storage bucket connectivity.
              </p>
            </div>
          </div>

          {/* Live Supabase Credentials Input */}
          <div className="p-6 rounded-3xl bg-white border border-[#E8DFC8] space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="font-cinzel text-sm font-bold text-[#2C241D] flex items-center gap-2">
                <Database className="w-4 h-4 text-[#8C531B]" />
                <span>Connected Supabase Project</span>
              </h3>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active Connection
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveSupabaseConfig} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
              <div className="sm:col-span-5 space-y-1">
                <label className="text-xs font-bold uppercase text-stone-600">Supabase Project URL</label>
                <input
                  type="text"
                  placeholder="https://xyzcompany.supabase.co"
                  value={supabaseUrlInput}
                  onChange={(e) => setSupabaseUrlInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-mono focus:ring-2 focus:ring-[#8C531B] focus:outline-none"
                />
              </div>

              <div className="sm:col-span-5 space-y-1">
                <label className="text-xs font-bold uppercase text-stone-600">Supabase Anon Key</label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={supabaseKeyInput}
                  onChange={(e) => setSupabaseKeyInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-mono focus:ring-2 focus:ring-[#8C531B] focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2 flex flex-col gap-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#2C241D] hover:bg-stone-800 text-white text-xs font-semibold transition-colors"
                >
                  Save & Connect
                </button>
              </div>
            </form>

            <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <p className="text-xs text-stone-500">
                  Connected to: <span className="font-mono font-medium text-stone-700">{supabaseUrlInput || DEFAULT_SUPABASE_URL}</span>
                </p>
                <button
                  type="button"
                  onClick={handleResetToDefaultSupabase}
                  className="text-[11px] text-[#8C531B] underline hover:text-stone-900 transition-colors"
                >
                  Reset to Default Project
                </button>
              </div>

              <button
                type="button"
                onClick={handleSeedPaintingsToSupabase}
                disabled={isSeedingSupabase}
                className="px-4 py-2 rounded-xl bg-[#FAF6EE] hover:bg-[#F2EADB] border border-[#E8DFC8] text-[#8C531B] text-xs font-semibold flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {isSeedingSupabase ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                <span>{isSeedingSupabase ? 'Syncing to Supabase...' : 'Push All Gallery Artworks to Supabase'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAINTING ADD / EDIT MODAL */}
      {isPaintingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto animate-in fade-in">
          <div className="bg-[#FAF8F5] w-full max-w-2xl rounded-3xl shadow-2xl border border-[#E8DFC8] overflow-hidden my-auto flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="bg-[#2C241D] text-[#FAF6ED] px-6 py-4 flex items-center justify-between">
              <h3 className="font-cinzel text-lg font-bold text-[#FDF6E2]">
                {editingPainting ? 'Edit Artwork Listing' : 'Add New Painting to Gallery'}
              </h3>
              <button 
                onClick={() => setIsPaintingModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSavePaintingSubmit} className="p-6 overflow-y-auto space-y-5">
              
              {/* Form Error Banner */}
              {formErrorMessage && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 flex items-start gap-3 shadow-sm animate-in fade-in">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-red-900">Database / Form Error:</p>
                    <p className="text-red-700 leading-relaxed break-words">{formErrorMessage}</p>
                    {formErrorMessage.toLowerCase().includes('policy') || formErrorMessage.toLowerCase().includes('permission') || formErrorMessage.toLowerCase().includes('row-level') ? (
                      <p className="text-[11px] text-red-600 mt-1">
                        💡 <strong>Hint:</strong> Row Level Security (RLS) is blocking this operation. Please execute the RLS policies SQL in your Supabase SQL Editor (available under the "Supabase SQL Schema" tab).
                      </p>
                    ) : null}
                  </div>
                </div>
              )}

              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  Painting Title <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName || ''}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g., Shrinathji Lotus Pichwai with 24K Gold Leaf"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm focus:ring-2 focus:ring-[#8C531B] focus:outline-none"
                />
              </div>

              {/* Type, Size, Price, Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    Medium / Category
                  </label>
                  <select
                    value={formType || 'Pichwai'}
                    onChange={(e) => setFormType(e.target.value as PaintingType)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-sm focus:ring-2 focus:ring-[#8C531B] focus:outline-none"
                  >
                    <option value="Pichwai">Pichwai</option>
                    <option value="Sketch">Realistic Sketch</option>
                    <option value="Watercolor">Watercolor</option>
                    <option value="Acrylic">Acrylic</option>
                    <option value="Oil">Oil</option>
                    <option value="Rajput Miniature">Rajput Miniature</option>
                    <option value="Charcoal">Charcoal</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    Dimensions (Size) <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formSize || ''}
                    onChange={(e) => setFormSize(e.target.value)}
                    placeholder="e.g., 24 x 36 inches"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-sm focus:ring-2 focus:ring-[#8C531B] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    Price in INR (₹) <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="500"
                    value={formPrice ?? 0}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-sm focus:ring-2 focus:ring-[#8C531B] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    Availability Status
                  </label>
                  <select
                    value={formStatus || 'available'}
                    onChange={(e) => setFormStatus(e.target.value as PaintingStatus)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-sm focus:ring-2 focus:ring-[#8C531B] focus:outline-none"
                  >
                    <option value="available">Available (Ready for sale)</option>
                    <option value="sold">Sold (Archived / In private collection)</option>
                  </select>
                </div>
              </div>

              {/* Multi-Photo & High-Res Artwork Images Section */}
              <div className="space-y-3 p-4 rounded-2xl bg-stone-50 border border-stone-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-2">
                      <Images className="w-4 h-4 text-[#8C531B]" />
                      <span>Artwork Photos & Multi-Angle Gallery</span>
                      <span className="text-[11px] font-normal text-stone-500">
                        ({formImages.length} {formImages.length === 1 ? 'photo' : 'photos'} added)
                      </span>
                    </label>
                    <p className="text-[11px] text-stone-500">
                      Upload multiple high-res photos (close-up details, angles, framing). Click the star to set the primary cover photo.
                    </p>
                  </div>

                  {/* Upload button */}
                  <button
                    type="button"
                    disabled={isUploadingImage}
                    onClick={() => paintingFileInputRef.current?.click()}
                    className="px-3.5 py-1.5 rounded-xl bg-[#8C531B] hover:bg-[#734314] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm disabled:opacity-50 shrink-0 cursor-pointer"
                  >
                    {isUploadingImage ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Uploading Images...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Photos from Device</span>
                      </>
                    )}
                  </button>
                </div>

                <input
                  ref={paintingFileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePaintingImageUpload}
                  className="hidden"
                />

                {/* Direct Image URL input */}
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={newImageUrlInput}
                    onChange={(e) => setNewImageUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddImageUrl();
                      }
                    }}
                    placeholder="Paste image URL (https://...) and click Add Photo"
                    className="flex-1 px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-xs font-mono focus:ring-2 focus:ring-[#8C531B] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-3.5 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold shrink-0"
                  >
                    Add URL
                  </button>
                </div>

                {/* Uploaded Photos Visual Grid */}
                {formImages.length > 0 ? (
                  <div className="space-y-2 pt-1">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {formImages.map((imgUrl, index) => {
                        const isPrimary = (formImageUrl === imgUrl) || (!formImageUrl && index === 0);
                        return (
                          <div
                            key={index}
                            className={`group relative rounded-xl overflow-hidden border-2 transition-all bg-stone-900 aspect-4/3 flex flex-col justify-between ${
                              isPrimary 
                                ? 'border-[#8C531B] ring-2 ring-[#8C531B]/30' 
                                : 'border-stone-200 hover:border-stone-400'
                            }`}
                          >
                            <img
                              src={imgUrl}
                              alt={`Artwork photo ${index + 1}`}
                              className="w-full h-full object-cover"
                            />

                            {/* Top Badges & Remove Button */}
                            <div className="absolute top-1.5 left-1.5 right-1.5 flex items-center justify-between pointer-events-auto">
                              {isPrimary ? (
                                <span className="px-2 py-0.5 rounded-md bg-[#8C531B] text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-md">
                                  <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                                  <span>Cover Photo</span>
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono">
                                  #{index + 1}
                                </span>
                              )}

                              <button
                                type="button"
                                onClick={() => handleRemoveImage(imgUrl)}
                                className="p-1 rounded-full bg-black/70 hover:bg-rose-600 text-white transition-colors shadow-md"
                                title="Remove photo"
                                aria-label="Remove photo"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Bottom Set-as-Cover button overlay */}
                            {!isPrimary && (
                              <div className="absolute bottom-1.5 left-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  type="button"
                                  onClick={() => handleSetPrimaryImage(imgUrl)}
                                  className="w-full py-1 px-2 rounded-lg bg-black/80 hover:bg-[#8C531B] text-white text-[10px] font-semibold tracking-wider uppercase transition-colors flex items-center justify-center gap-1 shadow-md"
                                >
                                  <Star className="w-3 h-3 text-amber-300" />
                                  <span>Set as Cover</span>
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => paintingFileInputRef.current?.click()}
                    className="p-6 rounded-xl border-2 border-dashed border-stone-300 bg-white text-center cursor-pointer hover:border-[#8C531B] transition-colors"
                  >
                    <Upload className="w-6 h-6 mx-auto text-stone-400 mb-1" />
                    <div className="text-xs font-semibold text-stone-700">Click to upload photos or drag and drop</div>
                    <div className="text-[11px] text-stone-400">Supports PNG, JPG, WebP (Multiple files supported)</div>
                  </div>
                )}
              </div>

              {/* Medium Details */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  Materials & Technique Details
                </label>
                <input
                  type="text"
                  value={formMediumDetails || ''}
                  onChange={(e) => setFormMediumDetails(e.target.value)}
                  placeholder="e.g. Natural Mineral Pigments & 24K Gold Leaf on Handwoven Fabric"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-sm focus:ring-2 focus:ring-[#8C531B] focus:outline-none"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  Artwork Description
                </label>
                <textarea
                  rows={3}
                  value={formDescription || ''}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Describe the artistic inspiration, spiritual significance, and craftsmanship..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-sm focus:ring-2 focus:ring-[#8C531B] focus:outline-none"
                ></textarea>
              </div>

              {/* Featured Flag */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="featured-checkbox"
                  checked={formFeatured}
                  onChange={(e) => setFormFeatured(e.target.checked)}
                  className="w-4 h-4 text-[#8C531B] rounded border-stone-300 focus:ring-[#8C531B]"
                />
                <label htmlFor="featured-checkbox" className="text-xs font-medium text-stone-800 cursor-pointer">
                  Feature prominently on gallery showcase top bar
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPaintingModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingPainting}
                  className="px-6 py-2.5 rounded-xl bg-[#8C531B] hover:bg-[#734314] text-white text-xs font-semibold shadow-sm"
                >
                  {isSubmittingPainting ? 'Saving Artwork...' : editingPainting ? 'Update Painting' : 'Publish Painting'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* FULL-SCREEN REFERENCE IMAGE VIEWER MODAL */}
      {previewReferenceImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setPreviewReferenceImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-amber-400 p-1"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={previewReferenceImage}
              alt="Client Reference Full Preview"
              className="max-h-[80vh] max-w-full object-contain rounded-xl shadow-2xl border-2 border-stone-700"
            />
            <div className="mt-3 flex items-center gap-3">
              <a
                href={previewReferenceImage}
                target="_blank"
                rel="noopener noreferrer"
                download="client_reference_photo.jpg"
                className="px-4 py-2 rounded-xl bg-[#C88A3B] text-black font-semibold text-xs flex items-center gap-1.5 shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>Open / Download Reference Photo</span>
              </a>
              <button
                onClick={() => setPreviewReferenceImage(null)}
                className="px-4 py-2 rounded-xl bg-stone-800 text-white text-xs"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
