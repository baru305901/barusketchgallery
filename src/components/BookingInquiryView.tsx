import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Send, 
  CheckCircle2, 
  Image as ImageIcon, 
  X, 
  Sparkles, 
  MessageCircle, 
  Phone, 
  Mail, 
  Info,
  Clock,
  ShieldCheck,
  Palette
} from 'lucide-react';
import { Painting } from '../types';
import { createEnquiry } from '../lib/store';
import { getSupabase } from '../lib/supabaseClient';
import confetti from 'canvas-confetti';

interface BookingInquiryViewProps {
  paintings: Painting[];
  initialPainting?: Painting | null;
  onClearInitialPainting?: () => void;
}

export const BookingInquiryView: React.FC<BookingInquiryViewProps> = ({ 
  paintings,
  initialPainting,
  onClearInitialPainting
}) => {
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [subject, setSubject] = useState(() => initialPainting ? `Custom variation of '${initialPainting.name}'` : 'Custom Pichwai (Nathdwara Style)');
  const [message, setMessage] = useState(() =>
    initialPainting 
      ? `Namaste Vishal ji, I am interested in ordering a customized version of your painting "${initialPainting.name}". My preferred dimensions are: `
      : ''
  );
  const [relatedPaintingId, setRelatedPaintingId] = useState(() => initialPainting?.id || '');

  // Synchronize when initialPainting changes
  React.useEffect(() => {
    if (initialPainting) {
      setSubject(`Custom variation of '${initialPainting.name}'`);
      setMessage(`Namaste Vishal ji, I am interested in ordering a customized version of your painting "${initialPainting.name}". My preferred dimensions are: `);
      setRelatedPaintingId(initialPainting.id || '');
    }
  }, [initialPainting]);
  
  // Reference photo upload state
  const [referenceImageDataUrl, setReferenceImageDataUrl] = useState<string | null>(null);
  const [referenceFileName, setReferenceFileName] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEnquiryId, setSubmittedEnquiryId] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const subjectOptions = [
    'Custom Pichwai (Nathdwara Style)',
    'Custom Portrait (Charcoal / Pencil Sketch)',
    'Watercolor Landscape / Haveli Artwork',
    'Rajput Miniature Commission',
    'Custom Canvas Size / Framing Query',
    'General Question & Price Quote'
  ];

  // Handle image upload from client device
  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Image size exceeds 10MB. Please choose a smaller reference file.');
      return;
    }

    setReferenceFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      setReferenceImageDataUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientEmail.trim() || !message.trim()) {
      alert('Please fill in your Name, Email, and Message.');
      return;
    }

    setIsUploading(true);

    try {
      let finalImageUrl = referenceImageDataUrl || undefined;

      // If live Supabase client is active, attempt upload to 'inquiry-reference-images' bucket
      const supabase = getSupabase();
      if (supabase && referenceImageDataUrl && fileInputRef.current?.files?.[0]) {
        try {
          const file = fileInputRef.current.files[0];
          const filePath = `inquiries/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('inquiry-reference-images')
            .upload(filePath, file);

          if (!uploadError && uploadData) {
            const { data: publicUrlData } = supabase.storage
              .from('inquiry-reference-images')
              .getPublicUrl(filePath);
            
            if (publicUrlData?.publicUrl) {
              finalImageUrl = publicUrlData.publicUrl;
            }
          }
        } catch (storageErr) {
          console.warn('Supabase storage upload fallback to data URL:', storageErr);
        }
      }

      const relatedPainting = paintings.find(p => p.id === relatedPaintingId);

      const created = await createEnquiry({
        client_name: clientName.trim(),
        client_email: clientEmail.trim(),
        client_phone: clientPhone.trim() || undefined,
        subject: subject,
        message: message.trim(),
        reference_image_url: finalImageUrl,
        related_painting_id: relatedPaintingId || undefined,
        related_painting_name: relatedPainting?.name || undefined
      });

      setSubmittedEnquiryId(created.id);
      setIsSubmitted(true);

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.error('Error submitting enquiry:', err);
      alert('There was an issue submitting your inquiry. Please try contacting Vishal directly on WhatsApp.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleResetForm = () => {
    setClientName('');
    setClientEmail('');
    setClientPhone('');
    setSubject('Custom Pichwai');
    setMessage('');
    setRelatedPaintingId('');
    setReferenceImageDataUrl(null);
    setReferenceFileName('');
    setIsSubmitted(false);
    if (onClearInitialPainting) onClearInitialPainting();
  };

  return (
    <div className="space-y-10 pb-16">
      
      {/* Header Banner */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E9DDCC] border border-[#D6C8B8] text-[#6B452D] text-[10px] font-bold uppercase tracking-[0.25em] font-sans-ui rounded-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Bespoke Handcrafted Orders</span>
        </div>

        <h1 className="font-cinzel text-3xl sm:text-4xl md:text-5xl font-bold text-[#2D241E]">
          Custom Commission & Inquiry
        </h1>

        <p className="font-cormorant text-xl sm:text-2xl text-[#4A2F1F] leading-relaxed italic">
          Commission a personalized Shrinathji Pichwai, a lifelike family portrait sketch, or a specific temple canvas crafted exclusively for your home.
        </p>
      </section>

      {/* Main Grid: Form + Artist Guarantee Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Form Container */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 sm:p-10 border border-[#D6C8B8] shadow-xs">
          
          {isSubmitted ? (
            <div className="text-center py-10 space-y-6 animate-in fade-in font-sans-ui">
              <div className="w-16 h-16 rounded-2xl bg-[#6B452D] text-white flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <h3 className="font-cinzel text-2xl font-bold text-[#2D241E]">
                  Inquiry Received Successfully!
                </h3>
                <p className="text-xs sm:text-sm text-[#4A2F1F] max-w-md mx-auto">
                  Thank you, <strong>{clientName}</strong>. Your custom art request has been recorded. Artist Vishal Baru will review your requirements and reference photo.
                </p>
                <div className="text-xs text-[#6B452D] font-mono font-semibold">
                  Reference ID: {submittedEnquiryId}
                </div>
              </div>

              {/* Instant WhatsApp follow up button */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={`https://wa.me/918000917547?text=${encodeURIComponent(
                    `Hi Vishal ji, I just submitted an inquiry on your website (Ref: ${submittedEnquiryId}) for "${subject}". Looking forward to discussing details.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3 bg-[#6B452D] hover:bg-[#4A2F1F] text-[#FFFFFF] font-semibold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all rounded-md shadow-xs"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-300" />
                  <span>Notify Vishal on WhatsApp</span>
                </a>

                <button
                  onClick={handleResetForm}
                  className="w-full sm:w-auto px-6 py-3 bg-[#E9DDCC] hover:bg-[#D6C8B8] text-[#2D241E] text-xs uppercase tracking-widest font-semibold border border-[#D6C8B8] transition-colors rounded-md"
                >
                  Submit Another Inquiry
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 font-sans-ui">
              
              {initialPainting && (
                <div className="p-4 rounded-xl bg-[#E9DDCC]/60 border border-[#D6C8B8] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img 
                      src={initialPainting.image_url} 
                      alt={initialPainting.name} 
                      className="w-12 h-12 rounded-lg object-cover border border-[#D6C8B8]"
                    />
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-[#6B452D]">Inquiring About:</div>
                      <div className="text-sm font-cinzel font-bold text-[#2D241E]">{initialPainting.name}</div>
                    </div>
                  </div>
                  {onClearInitialPainting && (
                    <button
                      type="button"
                      onClick={onClearInitialPainting}
                      className="p-1 rounded-md text-[#4A2F1F]/60 hover:text-[#2D241E] hover:bg-[#E9DDCC]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}

              {/* Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#4A2F1F]">
                    Your Full Name <span className="text-[#8B0000]">*</span>
                  </label>
                  <input
                    id="inquiry-client-name"
                    type="text"
                    required
                    value={clientName || ''}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g., Rajesh Sharma"
                    className="w-full px-4 py-2.5 rounded-lg border border-[#D6C8B8] bg-white text-xs text-[#2D241E] focus:outline-none focus:ring-1 focus:ring-[#6B452D] focus:border-[#6B452D] transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#4A2F1F]">
                    Email Address <span className="text-[#8B0000]">*</span>
                  </label>
                  <input
                    id="inquiry-client-email"
                    type="email"
                    required
                    value={clientEmail || ''}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="e.g., rajesh@example.com"
                    className="w-full px-4 py-2.5 rounded-lg border border-[#D6C8B8] bg-white text-xs text-[#2D241E] focus:outline-none focus:ring-1 focus:ring-[#6B452D] focus:border-[#6B452D] transition-all"
                  />
                </div>
              </div>

              {/* Phone & Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#4A2F1F]">
                    Mobile / WhatsApp Number
                  </label>
                  <input
                    id="inquiry-client-phone"
                    type="tel"
                    value={clientPhone || ''}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="e.g., +91 9876543210"
                    className="w-full px-4 py-2.5 rounded-lg border border-[#D6C8B8] bg-white text-xs text-[#2D241E] focus:outline-none focus:ring-1 focus:ring-[#6B452D] focus:border-[#6B452D] transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#4A2F1F]">
                    Commission Subject <span className="text-[#8B0000]">*</span>
                  </label>
                  <select
                    id="inquiry-subject-select"
                    value={subject || 'Custom Pichwai (Nathdwara Style)'}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-[#D6C8B8] bg-white text-xs text-[#2D241E] focus:outline-none focus:ring-1 focus:ring-[#6B452D] focus:border-[#6B452D] transition-all cursor-pointer"
                  >
                    {subjectOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Related painting dropdown (optional) */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#4A2F1F]">
                  Related Gallery Artwork (Optional)
                </label>
                <select
                  value={relatedPaintingId || ''}
                  onChange={(e) => setRelatedPaintingId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-[#D6C8B8] bg-white text-xs focus:outline-none focus:ring-1 focus:ring-[#6B452D] text-[#2D241E]"
                >
                  <option value="">-- No specific painting / Purely custom idea --</option>
                  {paintings.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.type} • ₹{p.price.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              {/* Reference Image Upload Area (Critical Requirement) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#4A2F1F] flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-[#6B452D]" />
                    <span>Upload Reference Image (Photo / Sketch / Room Wall)</span>
                  </label>
                  <span className="text-[10px] text-[#7B6858] font-sans-ui">JPG, PNG, WEBP up to 10MB</span>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={onFileInputChange}
                  className="hidden"
                  id="reference-file-input"
                />

                {referenceImageDataUrl ? (
                  <div className="p-4 rounded-xl bg-[#E9DDCC]/60 border border-[#A8753F] flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <img 
                        src={referenceImageDataUrl} 
                        alt="Reference Preview" 
                        className="w-14 h-14 rounded-lg object-cover border border-[#D6C8B8] shrink-0"
                      />
                      <div className="truncate">
                        <div className="text-xs font-semibold text-[#6B452D] flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Reference Image Attached</span>
                        </div>
                        <div className="text-[11px] text-[#4A2F1F] truncate font-mono mt-0.5">
                          {referenceFileName || 'Uploaded Image'}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setReferenceImageDataUrl(null);
                        setReferenceFileName('');
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="p-2 rounded-lg text-[#4A2F1F] hover:text-[#8B0000] hover:bg-[#8B0000]/10 transition-colors"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={onDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-6 sm:p-8 rounded-xl border border-dashed cursor-pointer transition-all duration-200 text-center space-y-2 ${
                      isDragOver 
                        ? 'border-[#6B452D] bg-[#F7F1E7]' 
                        : 'border-[#D6C8B8] hover:border-[#6B452D] bg-[#F7F1E7]/70 hover:bg-[#F7F1E7]'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-white text-[#6B452D] border border-[#D6C8B8] flex items-center justify-center mx-auto shadow-xs">
                      <Upload className="w-5 h-5 text-[#6B452D]" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-[#6B452D] hover:underline uppercase tracking-wider">
                        Click to browse photo
                      </span>
                      <span className="text-xs text-[#7B6858]"> or drag and drop here</span>
                    </div>
                    <p className="text-[11px] text-[#7B6858]">
                      Upload family photos for portrait sketches, mandir dimensions, or idol reference photos
                    </p>
                  </div>
                )}
              </div>

              {/* Message Body */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#4A2F1F]">
                  Message & Custom Specifications <span className="text-[#8B0000]">*</span>
                </label>
                <textarea
                  id="inquiry-message"
                  required
                  rows={4}
                  value={message || ''}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your desired size (e.g. 3x4 feet, 18x24 inches), color preferences, framing, delivery timeline, or questions..."
                  className="w-full px-4 py-3 rounded-lg border border-[#D6C8B8] bg-white text-xs text-[#2D241E] focus:outline-none focus:ring-1 focus:ring-[#6B452D] focus:border-[#6B452D] transition-all"
                ></textarea>
              </div>

              {/* Submit Button */}
              <button
                id="submit-commission-btn"
                type="submit"
                disabled={isUploading}
                className="w-full py-3.5 px-6 bg-[#6B452D] hover:bg-[#4A2F1F] text-[#FFFFFF] font-semibold text-xs uppercase tracking-[0.2em] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 shadow-xs rounded-md"
              >
                {isUploading ? (
                  <span>Submitting Inquiry...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-[#E9DDCC]" />
                    <span>Send Custom Order Inquiry</span>
                  </>
                )}
              </button>

              <div className="text-center text-[11px] text-[#7B6858] font-sans-ui">
                Vishal Baru personally reviews all custom inquiries and typically responds within 2-4 hours.
              </div>

            </form>
          )}

        </div>

        {/* Right Info Card: Commission Process & Direct Contact */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* 4-Step Process */}
          <div className="p-6 rounded-2xl bg-[#F7F1E7] border border-[#D6C8B8] space-y-5">
            <h3 className="font-cinzel text-base font-bold text-[#2D241E] flex items-center gap-2">
              <Palette className="w-4 h-4 text-[#6B452D]" />
              <span>How Commissioning Works</span>
            </h3>

            <ol className="space-y-4 text-xs text-[#4A2F1F] font-sans-ui">
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-md bg-[#6B452D] text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                <div>
                  <strong className="text-[#2D241E] block font-semibold uppercase tracking-wider text-[11px]">Submit Details & Photo</strong>
                  Upload your reference picture and specify canvas dimensions or paper type.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-md bg-[#6B452D] text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                <div>
                  <strong className="text-[#2D241E] block font-semibold uppercase tracking-wider text-[11px]">Price & Timeline Estimate</strong>
                  Vishal calculates the required materials (gold leaf, stone pigments) and timeline.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-md bg-[#6B452D] text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                <div>
                  <strong className="text-[#2D241E] block font-semibold uppercase tracking-wider text-[11px]">Progress Photos on WhatsApp</strong>
                  Receive work-in-progress snapshots during pencil outline, base washes, and final detailing.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-md bg-[#6B452D] text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">4</span>
                <div>
                  <strong className="text-[#2D241E] block font-semibold uppercase tracking-wider text-[11px]">Safe Delivery to Your Doorstep</strong>
                  Insured courier dispatch with physical Certificate of Authenticity.
                </div>
              </li>
            </ol>
          </div>

          {/* Urgent Direct Contact */}
          <div className="p-6 rounded-2xl bg-[#4A2F1F] text-[#F7F1E7] border border-[#3D2517] space-y-4 font-sans-ui">
            <h3 className="font-cinzel text-base font-bold text-[#F7F1E7]">
              Have an Urgent Order?
            </h3>
            <p className="text-xs text-[#E9DDCC] leading-relaxed">
              If you need an anniversary gift portrait or festive Pichwai on priority, contact artist Vishal Baru directly:
            </p>

            <div className="space-y-2 pt-1 text-xs">
              <a
                href="https://wa.me/918000917547"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-lg bg-[#3D2517] hover:bg-[#6B452D] text-[#F7F1E7] border border-white/10 font-semibold uppercase tracking-wider text-[11px] flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-300" />
                <span>WhatsApp: +91 8000917547</span>
              </a>

              <a
                href="tel:+918000917547"
                className="w-full py-2.5 px-4 rounded-lg bg-[#3D2517] hover:bg-[#6B452D] text-[#F7F1E7] border border-white/10 font-semibold uppercase tracking-wider text-[11px] flex items-center justify-center gap-2 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-[#E9DDCC]" />
                <span>Call Artist Direct</span>
              </a>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
