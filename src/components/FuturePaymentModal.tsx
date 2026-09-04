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
    theme: { color: '#6B452D' }
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
      <div className="bg-[#F7F1E7] text-[#2D241E] w-full max-w-3xl rounded-2xl shadow-2xl border border-[#D6C8B8] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[#4A2F1F] text-[#F7F1E7] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#6B452D] text-[#E9DDCC]">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-cinzel text-lg font-bold text-[#F7F1E7]">
                Future Payment Gateway Integration
              </h3>
              <p className="text-xs text-[#E9DDCC]">
                Razorpay (India) & Stripe (Global) Developer Architecture
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#E9DDCC] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-[#D6C8B8] bg-[#E9DDCC]/50 px-6 pt-2 gap-2 text-xs uppercase tracking-wider font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-3 transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-[#6B452D] text-[#6B452D] font-bold'
                : 'border-transparent text-[#7B6858] hover:text-[#2D241E]'
            }`}
          >
            Transition Blueprint
          </button>
          <button
            onClick={() => setActiveTab('razorpay')}
            className={`pb-3 px-3 transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'razorpay'
                ? 'border-[#6B452D] text-[#6B452D] font-bold'
                : 'border-transparent text-[#7B6858] hover:text-[#2D241E]'
            }`}
          >
            <span>Razorpay (India / UPI / Cards)</span>
          </button>
          <button
            onClick={() => setActiveTab('stripe')}
            className={`pb-3 px-3 transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'stripe'
                ? 'border-[#6B452D] text-[#6B452D] font-bold'
                : 'border-transparent text-[#7B6858] hover:text-[#2D241E]'
            }`}
          >
            <span>Stripe (International)</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 text-[#2D241E]">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white border border-[#D6C8B8] flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[#6B452D] shrink-0 mt-0.5" />
                <div className="text-xs text-[#4A2F1F] leading-relaxed">
                  <p className="font-semibold text-[#2D241E] mb-1">Current State: Direct WhatsApp Lead System</p>
                  Clicking <strong>"Buy Now"</strong> currently triggers a personalized WhatsApp message to Vishal Baru (<code className="bg-[#E9DDCC] px-1.5 py-0.5 rounded border border-[#D6C8B8] font-mono text-[11px] text-[#2D241E]">+91 8000917547</code>) with the painting title, size, and price. This allows direct personal negotiation, framing preferences, and cash-on-delivery arrangements.
                </div>
              </div>

              <h4 className="font-cinzel text-base font-bold text-[#2D241E] pt-2">
                3 Simple Steps to Enable 1-Click Instant Checkout:
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-white border border-[#D6C8B8] space-y-2">
                  <div className="w-7 h-7 rounded-md bg-[#6B452D] text-white flex items-center justify-center font-bold text-xs">1</div>
                  <h5 className="font-semibold text-xs uppercase tracking-wider text-[#2D241E]">Create Merchant Keys</h5>
                  <p className="text-xs text-[#4A2F1F]">
                    Register at Razorpay.com or Stripe.com, complete KYC, and obtain API Keys (<code className="text-[10px] bg-[#E9DDCC] px-1 rounded">KEY_ID</code> & <code className="text-[10px] bg-[#E9DDCC] px-1 rounded">KEY_SECRET</code>).
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#D6C8B8] space-y-2">
                  <div className="w-7 h-7 rounded-md bg-[#6B452D] text-white flex items-center justify-center font-bold text-xs">2</div>
                  <h5 className="font-semibold text-xs uppercase tracking-wider text-[#2D241E]">Add Server Route</h5>
                  <p className="text-xs text-[#4A2F1F]">
                    Paste the provided API order handler code in your Next.js route (<code className="text-[10px] bg-[#E9DDCC] px-1 rounded">/api/payment</code>).
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#D6C8B8] space-y-2">
                  <div className="w-7 h-7 rounded-md bg-[#6B452D] text-white flex items-center justify-center font-bold text-xs">3</div>
                  <h5 className="font-semibold text-xs uppercase tracking-wider text-[#2D241E]">Auto-Status Update</h5>
                  <p className="text-xs text-[#4A2F1F]">
                    On payment verification webhook, automatically update Supabase <code className="text-[10px] bg-[#E9DDCC] px-1 rounded">paintings.status = 'sold'</code>.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#D6C8B8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-bold text-[#6B452D] uppercase tracking-wider">Currently Selected Artwork</div>
                  <div className="text-sm font-bold font-cinzel text-[#2D241E]">{painting.name}</div>
                  <div className="text-xs text-[#7B6858]">Price: ₹{painting.price.toLocaleString('en-IN')} • Size: {painting.size}</div>
                </div>
                <button
                  onClick={() => setActiveTab('razorpay')}
                  className="px-4 py-2 bg-[#6B452D] hover:bg-[#4A2F1F] text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 rounded-lg transition-colors"
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
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-[#2D241E]">Razorpay Integration Code (Next.js App Router)</h4>
                  <p className="text-xs text-[#7B6858]">Supports UPI (GPay, PhonePe, Paytm), NetBanking, Credit/Debit cards & EMI</p>
                </div>
                <button
                  onClick={() => copyToClipboard(razorpaySnippet)}
                  className="px-3 py-1.5 bg-[#E9DDCC] hover:bg-[#D6C8B8] border border-[#D6C8B8] text-xs uppercase tracking-wider font-semibold flex items-center gap-1 text-[#4A2F1F] transition-colors rounded-lg"
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5 text-[#6B452D]" />}
                  <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-[#2D241E] text-[#F7F1E7] text-xs font-mono overflow-x-auto leading-relaxed border border-[#4A2F1F]">
                <code>{razorpaySnippet}</code>
              </pre>
            </div>
          )}

          {activeTab === 'stripe' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-[#2D241E]">Stripe Checkout Integration Code</h4>
                  <p className="text-xs text-[#7B6858]">Ideal for international art collectors purchasing with USD, EUR, GBP</p>
                </div>
                <button
                  onClick={() => copyToClipboard(stripeSnippet)}
                  className="px-3 py-1.5 bg-[#E9DDCC] hover:bg-[#D6C8B8] border border-[#D6C8B8] text-xs uppercase tracking-wider font-semibold flex items-center gap-1 text-[#4A2F1F] transition-colors rounded-lg"
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5 text-[#6B452D]" />}
                  <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-[#2D241E] text-[#E9DDCC] text-xs font-mono overflow-x-auto leading-relaxed border border-[#4A2F1F]">
                <code>{stripeSnippet}</code>
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#E9DDCC]/50 px-6 py-3.5 border-t border-[#D6C8B8] flex items-center justify-between">
          <span className="text-xs text-[#7B6858]">
            Documented and pre-configured for future activation in Next.js
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#6B452D] hover:bg-[#4A2F1F] text-white text-xs font-semibold uppercase tracking-wider transition-colors rounded-lg"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
