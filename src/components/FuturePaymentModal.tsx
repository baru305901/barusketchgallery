import React, { useState } from 'react';
import { 
  X, 
  CreditCard, 
  Code, 
  CheckCircle2, 
  Copy, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck,
  Zap,
  ArrowRight
} from 'lucide-react';
import { Painting } from '../types';

interface FuturePaymentModalProps {
  painting: Painting | null;
  isOpen: boolean;
  onClose: () => void;
}

export const FuturePaymentModal: React.FC<FuturePaymentModalProps> = ({ painting, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'razorpay' | 'stripe' | 'migration'>('overview');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !painting) return null;

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const razorpaySnippet = `// Next.js App Router / React API handler for Razorpay order
import Razorpay from 'razorpay';

export async function POST(request: Request) {
  const { paintingId, price, name } = await request.json();

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });

  const order = await razorpay.orders.create({
    amount: price * 100, // Amount in paise (e.g. ₹${painting.price} = ${painting.price * 100} paise)
    currency: 'INR',
    receipt: \`receipt_\${paintingId}_\${Date.now()}\`,
    notes: {
      paintingId: paintingId,
      paintingName: name,
      artist: 'Vishal Baru'
    }
  });

  return Response.json(order);
}

// Client-side checkout invocation:
const handleRazorpayPayment = async (painting) => {
  const res = await fetch('/api/payment/razorpay-order', {
    method: 'POST',
    body: JSON.stringify({ paintingId: painting.id, price: painting.price, name: painting.name })
  });
  const orderData = await res.json();

  const options = {
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    amount: orderData.amount,
    currency: 'INR',
    name: 'Baru Sketch Gallery',
    description: painting.name,
    image: painting.image_url,
    order_id: orderData.id,
    handler: async function (response) {
      // 1. Verify payment signature on backend
      // 2. Mark painting as 'sold' in Supabase
      // 3. Send invoice to buyer & notify artist (+91 8000917547)
      alert('Payment Successful! Transaction ID: ' + response.razorpay_payment_id);
    },
    prefill: {
      name: 'Collector Name',
      email: 'buyer@example.com',
      contact: '+91 9999999999'
    },
    theme: { color: '#8C531B' }
  };

  const rzp = new (window as any).Razorpay(options);
  rzp.open();
};`;

  const stripeSnippet = `// Next.js / Stripe Checkout Session Handler
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(request: Request) {
  const { painting } = await request.json();

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'inr',
          product_data: {
            name: painting.name,
            description: \`Original artwork by Vishal Baru - Size: \${painting.size}\`,
            images: [painting.image_url],
          },
          unit_amount: painting.price * 100, // in smallest unit (paise)
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: \`\${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}\`,
    cancel_url: \`\${process.env.NEXT_PUBLIC_APP_URL}/gallery\`,
  });

  return Response.json({ url: session.url });
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200 font-sans-ui">
      <div className="bg-[#FDFBF7] text-[#1A1A1A] w-full max-w-3xl rounded-2xl shadow-2xl border border-[#1A1A1A]/20 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[#1A1A1A] text-[#FDFBF7] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#5A5A40] text-[#FDFBF7]">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-cinzel text-lg font-bold text-[#FDFBF7]">
                Future Payment Gateway Integration
              </h3>
              <p className="text-xs text-[#D6D0C5]">
                Razorpay (India) & Stripe (Global) Developer Architecture
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-[#1A1A1A]/10 bg-[#F5F2ED] px-6 pt-2 gap-2 text-xs uppercase tracking-wider font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-3 transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-[#1A1A1A] text-[#1A1A1A]'
                : 'border-transparent text-[#1A1A1A]/50 hover:text-[#1A1A1A]'
            }`}
          >
            Transition Blueprint
          </button>
          <button
            onClick={() => setActiveTab('razorpay')}
            className={`pb-3 px-3 transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'razorpay'
                ? 'border-[#1A1A1A] text-[#1A1A1A]'
                : 'border-transparent text-[#1A1A1A]/50 hover:text-[#1A1A1A]'
            }`}
          >
            <span>Razorpay (India / UPI / Cards)</span>
          </button>
          <button
            onClick={() => setActiveTab('stripe')}
            className={`pb-3 px-3 transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'stripe'
                ? 'border-[#1A1A1A] text-[#1A1A1A]'
                : 'border-transparent text-[#1A1A1A]/50 hover:text-[#1A1A1A]'
            }`}
          >
            <span>Stripe (International)</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 text-[#1A1A1A]">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#F5F2ED] border border-[#1A1A1A]/10 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[#5A5A40] shrink-0 mt-0.5" />
                <div className="text-xs text-[#1A1A1A]/80 leading-relaxed">
                  <p className="font-semibold text-[#1A1A1A] mb-1">Current State: Direct WhatsApp Lead System</p>
                  Clicking <strong>"Buy Now"</strong> currently triggers a personalized WhatsApp message to Vishal Baru (<code className="bg-white px-1.5 py-0.5 rounded border border-[#1A1A1A]/10 font-mono text-[11px]">+91 8000917547</code>) with the painting title, size, and price. This allows direct personal negotiation, framing preferences, and cash-on-delivery arrangements.
                </div>
              </div>

              <h4 className="font-cinzel text-base font-bold text-[#1A1A1A] pt-2">
                3 Simple Steps to Enable 1-Click Instant Checkout:
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-white border border-[#1A1A1A]/10 space-y-2">
                  <div className="w-7 h-7 rounded-md bg-[#1A1A1A] text-white flex items-center justify-center font-bold text-xs">1</div>
                  <h5 className="font-semibold text-xs uppercase tracking-wider">Create Merchant Keys</h5>
                  <p className="text-xs text-[#1A1A1A]/70">
                    Register at Razorpay.com or Stripe.com, complete KYC, and obtain API Keys (<code className="text-[10px] bg-stone-100 px-1">KEY_ID</code> & <code className="text-[10px] bg-stone-100 px-1">KEY_SECRET</code>).
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#1A1A1A]/10 space-y-2">
                  <div className="w-7 h-7 rounded-md bg-[#1A1A1A] text-white flex items-center justify-center font-bold text-xs">2</div>
                  <h5 className="font-semibold text-xs uppercase tracking-wider">Add Server Route</h5>
                  <p className="text-xs text-[#1A1A1A]/70">
                    Paste the provided API order handler code in your Next.js route (<code className="text-[10px] bg-stone-100 px-1">/api/payment</code>).
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#1A1A1A]/10 space-y-2">
                  <div className="w-7 h-7 rounded-md bg-[#1A1A1A] text-white flex items-center justify-center font-bold text-xs">3</div>
                  <h5 className="font-semibold text-xs uppercase tracking-wider">Auto-Status Update</h5>
                  <p className="text-xs text-[#1A1A1A]/70">
                    On payment verification webhook, automatically update Supabase <code className="text-[10px] bg-stone-100 px-1">paintings.status = 'sold'</code>.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F5F2ED] border border-[#1A1A1A]/10 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-[#5A5A40] uppercase tracking-wider">Currently Selected Artwork</div>
                  <div className="text-sm font-bold font-cinzel text-[#1A1A1A]">{painting.name}</div>
                  <div className="text-xs text-[#1A1A1A]/70">Price: ₹{painting.price.toLocaleString('en-IN')} • Size: {painting.size}</div>
                </div>
                <button
                  onClick={() => setActiveTab('razorpay')}
                  className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#5A5A40] text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                >
                  <span>View Razorpay Code</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'razorpay' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-[#1A1A1A]">Razorpay Integration Code (Next.js App Router)</h4>
                  <p className="text-xs text-[#1A1A1A]/60">Supports UPI (GPay, PhonePe, Paytm), NetBanking, Credit/Debit cards & EMI</p>
                </div>
                <button
                  onClick={() => copyToClipboard(razorpaySnippet)}
                  className="px-3 py-1.5 bg-[#F5F2ED] hover:bg-[#EAE4DB] border border-[#1A1A1A]/15 text-xs uppercase tracking-wider font-semibold flex items-center gap-1 text-[#1A1A1A] transition-colors"
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-[#1A1A1A] text-[#FDFBF7] text-xs font-mono overflow-x-auto leading-relaxed border border-[#1A1A1A]">
                <code>{razorpaySnippet}</code>
              </pre>
            </div>
          )}

          {activeTab === 'stripe' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-[#1A1A1A]">Stripe Checkout Integration Code</h4>
                  <p className="text-xs text-[#1A1A1A]/60">Ideal for international art collectors purchasing with USD, EUR, GBP</p>
                </div>
                <button
                  onClick={() => copyToClipboard(stripeSnippet)}
                  className="px-3 py-1.5 bg-[#F5F2ED] hover:bg-[#EAE4DB] border border-[#1A1A1A]/15 text-xs uppercase tracking-wider font-semibold flex items-center gap-1 text-[#1A1A1A] transition-colors"
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-[#1A1A1A] text-sky-200 text-xs font-mono overflow-x-auto leading-relaxed border border-[#1A1A1A]">
                <code>{stripeSnippet}</code>
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#F5F2ED] px-6 py-3.5 border-t border-[#1A1A1A]/10 flex items-center justify-between">
          <span className="text-xs text-[#1A1A1A]/60">
            Documented and pre-configured for future activation in Next.js
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#5A5A40] text-white text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
