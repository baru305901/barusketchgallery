/// <reference types="vite/client" />
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Connected Supabase Project Credentials
export const DEFAULT_SUPABASE_URL = 'https://lnpjssonfwpybetvumrj.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxucGpzc29uZndweWJldHZ1bXJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4MjQ4ODksImV4cCI6MjEwMzQwMDg4OX0.Iau6lIvzDaHNZt4UwPWcQ_n74t-9F4n3fVXhOegRWeo';

/**
 * Validates whether a given string is a valid HTTP/HTTPS URL
 */
export const isValidSupabaseUrl = (url: string | null | undefined): boolean => {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed || trimmed === 'null' || trimmed === 'undefined') return false;
  try {
    const parsed = new URL(trimmed);
    return (parsed.protocol === 'http:' || parsed.protocol === 'https:') && Boolean(parsed.hostname);
  } catch {
    return false;
  }
};

let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  if (supabaseInstance) return supabaseInstance;
  
  let targetUrl = DEFAULT_SUPABASE_URL;
  let targetKey = DEFAULT_SUPABASE_ANON_KEY;

  // 1. Check Vite Environment Variables if present and valid
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;
  if (isValidSupabaseUrl(envUrl)) {
    targetUrl = envUrl.trim();
  }
  if (envKey && typeof envKey === 'string' && envKey.trim().length > 10) {
    targetKey = envKey.trim();
  }

  // 2. Check LocalStorage customizations if valid
  if (typeof window !== 'undefined') {
    try {
      const storedUrl = localStorage.getItem('baru_supabase_url');
      const storedKey = localStorage.getItem('baru_supabase_key');

      if (storedUrl) {
        if (isValidSupabaseUrl(storedUrl)) {
          targetUrl = storedUrl.trim();
        } else {
          localStorage.removeItem('baru_supabase_url');
        }
      }

      if (storedKey) {
        if (typeof storedKey === 'string' && storedKey.trim().length > 10) {
          targetKey = storedKey.trim();
        } else {
          localStorage.removeItem('baru_supabase_key');
        }
      }
    } catch (storageReadErr) {
      console.warn('Could not read Supabase keys from localStorage:', storageReadErr);
    }
  }

  // 3. Ensure valid URL and Key before instantiating createClient
  if (isValidSupabaseUrl(targetUrl) && targetKey && targetKey.trim().length > 5) {
    try {
      supabaseInstance = createClient(targetUrl, targetKey.trim(), {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
      return supabaseInstance;
    } catch (e) {
      console.warn('Failed to initialize Supabase client:', e);
      supabaseInstance = null;
      return null;
    }
  }

  return null;
};

export const setSupabaseCredentials = (url: string, key: string): boolean => {
  const cleanUrl = url ? url.trim() : '';
  const cleanKey = key ? key.trim() : '';

  if (typeof window !== 'undefined') {
    try {
      if (isValidSupabaseUrl(cleanUrl)) {
        localStorage.setItem('baru_supabase_url', cleanUrl);
      } else {
        localStorage.removeItem('baru_supabase_url');
      }

      if (cleanKey && cleanKey.length > 5) {
        localStorage.setItem('baru_supabase_key', cleanKey);
      } else {
        localStorage.removeItem('baru_supabase_key');
      }
    } catch (storageErr) {
      console.warn('Error saving Supabase credentials to localStorage:', storageErr);
    }
  }

  // Reset cached instance
  supabaseInstance = null;

  if (isValidSupabaseUrl(cleanUrl) && cleanKey && cleanKey.length > 5) {
    try {
      supabaseInstance = createClient(cleanUrl, cleanKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
      return true;
    } catch (err) {
      console.error('Failed to instantiate Supabase client with custom credentials:', err);
      supabaseInstance = null;
      return false;
    }
  } else {
    // Re-initialize with default project credentials
    getSupabase();
    return false;
  }
};

/**
 * Upload image file / base64 data to Supabase Storage Bucket
 */
export const uploadImageToSupabase = async (
  fileOrBase64: File | string,
  bucketName: 'painting-images' | 'inquiry-reference-images' = 'inquiry-reference-images'
): Promise<string | null> => {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const fileExt = typeof fileOrBase64 === 'string' ? 'jpg' : fileOrBase64.name.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `${fileName}`;

    let body: any;
    let contentType = 'image/jpeg';

    if (typeof fileOrBase64 === 'string') {
      if (fileOrBase64.startsWith('data:')) {
        const matches = fileOrBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          contentType = matches[1];
          const byteCharacters = atob(matches[2]);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          body = new Uint8Array(byteNumbers);
        } else {
          return null;
        }
      } else {
        // Direct URL already
        return fileOrBase64;
      }
    } else {
      body = fileOrBase64;
      contentType = fileOrBase64.type || 'image/jpeg';
    }

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, body, {
        contentType,
        upsert: true
      });

    if (uploadError) {
      console.warn(`Supabase storage upload error on bucket ${bucketName}:`, uploadError.message);
      return null;
    }

    const { data: publicData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return publicData?.publicUrl || null;
  } catch (err) {
    console.warn('Image upload to Supabase failed:', err);
    return null;
  }
};
