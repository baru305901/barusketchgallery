import React, { useState } from 'react';
import { Lock, Key, AlertCircle, X } from 'lucide-react';

export interface AdminLoginModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess: () => void;
}

const ALLOWED_ADMIN_EMAIL = 'sketchartis007@gmail.com';
const VALID_MASTER_PASSCODES = ['baru7547', 'admin123', '305901'];

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen = true,
  onClose,
  onSuccess
}) => {
  const [email, setEmail] = useState('sketchartis007@gmail.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const cleanInputEmail = email.trim().toLowerCase();
    const cleanInputPassword = password.trim();
    const targetEmail = ALLOWED_ADMIN_EMAIL.trim().toLowerCase();

    // 1. Strict Email Verification
    if (cleanInputEmail !== targetEmail) {
      setError('Unauthorized Admin Email address.');
      setIsLoading(false);
      return;
    }

    // 2. Strict Passcode Verification
    if (!cleanInputPassword || !VALID_MASTER_PASSCODES.includes(cleanInputPassword)) {
      setError('Invalid Admin Passcode.');
      setIsLoading(false);
      return;
    }

    // Auth Successful
    localStorage.setItem('baru_admin_auth', 'true');
    setIsLoading(false);
    onSuccess();
  };

  return (
    <div className="max-w-md w-full mx-auto my-8 p-8 bg-white rounded-3xl border border-[#D6C8B8] shadow-xl space-y-6 relative">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#7B6858] hover:text-[#2D241E] transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-[#4A2F1F] text-[#E9DDCC] flex items-center justify-center mx-auto shadow-md">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="font-cinzel text-2xl font-bold text-[#2D241E]">
          Artist Control Panel
        </h2>
        <p className="text-xs text-[#7B6858]">
          Protected route for artist Vishal Baru to manage gallery catalog, commission leads, and database.
        </p>
      </div>

      {error && (
        <div 
          id="admin-auth-error"
          className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-wider text-[#4A2F1F]">
            Artist Email
          </label>
          <input
            id="admin-login-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-[#D6C8B8] text-sm text-[#2D241E] focus:ring-2 focus:ring-[#6B452D] focus:outline-none"
            placeholder="artist@example.com"
          />
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-[#4A2F1F]">
              Password / Passcode
            </label>
          </div>
          <input
            id="admin-login-password"
            type="password"
            required
            placeholder="Enter passcode"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-[#D6C8B8] text-sm text-[#2D241E] focus:ring-2 focus:ring-[#6B452D] focus:outline-none"
          />
        </div>

        <button
          id="admin-login-submit"
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-xl bg-[#6B452D] hover:bg-[#4A2F1F] text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Key className="w-4 h-4" />
          <span>{isLoading ? 'Verifying...' : 'Sign In to C-Panel'}</span>
        </button>
      </form>

      {onClose && (
        <div className="pt-4 border-t border-[#D6C8B8] text-center">
          <button
            onClick={onClose}
            className="text-xs text-[#7B6858] hover:text-[#2D241E]"
          >
            ← Return to Public Gallery
          </button>
        </div>
      )}
    </div>
  );
};
