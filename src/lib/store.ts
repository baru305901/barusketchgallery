import { Painting, Enquiry, PaintingStatus, EnquiryStatus } from '../types';
import { INITIAL_ENQUIRIES } from '../data/initialData';
import { getSupabase } from './supabaseClient';

const STORAGE_KEYS = {
  PAINTINGS: 'baru_gallery_paintings',
  ENQUIRIES: 'baru_gallery_enquiries',
  ADMIN_LOGGED_IN: 'baru_admin_auth_state'
};

export const isValidUUID = (id: string | null | undefined): boolean => {
  if (!id || typeof id !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id.trim());
};

export const generateEntityId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch {
      // fallback
    }
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Safely persist paintings to localStorage wrapped in try...catch so it never throws an unhandled QuotaExceededError
export const safeSetPaintingsStorage = (paintings: Painting[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.PAINTINGS, JSON.stringify(paintings));
  } catch (quotaError) {
    console.warn('[LocalStorage] Quota exceeded or error saving to baru_gallery_paintings:', quotaError);
    // If quota exceeded, attempt to cache a lightweight version without giant data URLs
    try {
      const lightweight = paintings.map(item => ({
        ...item,
        image_url: item.image_url?.startsWith('data:') && item.image_url.length > 200000 ? '' : item.image_url,
        images: (item.images || []).map(img => img.startsWith('data:') && img.length > 200000 ? '' : img).filter(Boolean)
      }));
      localStorage.setItem(STORAGE_KEYS.PAINTINGS, JSON.stringify(lightweight));
    } catch {
      // Gracefully prevent unhandled quota error from breaking the application
    }
  }
};

// Retrieve locally cached paintings, guaranteeing no fallback to dummy items
export const getStoredPaintings = (): Painting[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PAINTINGS);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Purge any legacy dummy mock items (e.g. 'p1', 'p2') that might have lingered in localStorage
      const cleanItems = parsed.filter(item => item && isValidUUID(item.id));
      if (cleanItems.length !== parsed.length) {
        safeSetPaintingsStorage(cleanItems);
      }
      return cleanItems;
    }
    return [];
  } catch (e) {
    console.error('Error reading stored paintings', e);
    return [];
  }
};

const getStoredEnquiries = (): Enquiry[] => {
  if (typeof window === 'undefined') return INITIAL_ENQUIRIES;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ENQUIRIES);
    if (!raw) {
      return INITIAL_ENQUIRIES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return INITIAL_ENQUIRIES;
  } catch (e) {
    console.error('Error reading stored enquiries', e);
    return INITIAL_ENQUIRIES;
  }
};

export const fetchPaintings = async (): Promise<Painting[]> => {
  let supabase = getSupabase();
  if (supabase) {
    try {
      let { data, error } = await supabase
        .from('paintings')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Auto-recovery if credentials in localStorage were invalid or expired
      if (error && (error.code === 'PGRST301' || error.message?.includes('JWT') || error.message?.includes('API key') || error.message?.includes('apikey'))) {
        console.warn('[Supabase Fetch Auth Error, retrying with default client]:', error.message);
        const { DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY, setSupabaseCredentials } = await import('./supabaseClient');
        setSupabaseCredentials(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY);
        supabase = getSupabase();
        if (supabase) {
          const retryRes = await supabase.from('paintings').select('*').order('created_at', { ascending: false });
          data = retryRes.data;
          error = retryRes.error;
        }
      }

      if (error) {
        console.error('[Supabase Fetch Error]:', error.message, error);
      } else if (data && data.length > 0) {
        const mappedData: Painting[] = data.map((row: any) => {
          let imagesList: string[] = [];
          if (Array.isArray(row.images)) {
            imagesList = row.images.filter((img: any) => typeof img === 'string' && img.trim().length > 0);
          } else if (typeof row.images === 'string' && row.images.trim().length > 0) {
            try {
              const parsed = JSON.parse(row.images);
              if (Array.isArray(parsed)) {
                imagesList = parsed.filter((img: any) => typeof img === 'string' && img.trim().length > 0);
              }
            } catch {
              if (row.images.startsWith('http') || row.images.startsWith('data:')) {
                imagesList = [row.images.trim()];
              }
            }
          }
          const primaryImg = row.image_url || imagesList[0] || '';
          if (imagesList.length === 0 && primaryImg) {
            imagesList = [primaryImg];
          }

          return {
            id: row.id,
            name: row.name || 'Untitled Artwork',
            description: row.description || '',
            size: row.size || '',
            price: isNaN(Number(row.price)) ? 0 : Number(row.price),
            type: (row.type || row.category || row.medium || 'Pichwai') as any,
            category: (row.category || row.type || row.medium || 'Pichwai'),
            medium: (row.medium || row.medium_details || row.type || 'Pichwai'),
            status: (row.status?.toString().toLowerCase() === 'sold') ? 'sold' : 'available',
            image_url: primaryImg,
            images: imagesList,
            medium_details: row.medium_details || row.medium || '',
            year: isNaN(Number(row.year)) ? new Date().getFullYear() : Number(row.year),
            featured: Boolean(row.featured),
            created_at: row.created_at || new Date().toISOString(),
            user_id: row.user_id
          };
        });

        // Sync local storage with latest remote records from Supabase
        try {
          safeSetPaintingsStorage(mappedData);
        } catch (storageErr) {
          console.warn('[LocalStorage] Safe catch on saving fetched paintings:', storageErr);
        }
        return mappedData;
      } else if (data && data.length === 0) {
        // Connected to Supabase and confirmed empty table
        try {
          safeSetPaintingsStorage([]);
        } catch (storageErr) {
          console.warn('[LocalStorage] Safe catch on clearing paintings:', storageErr);
        }
        return [];
      }
    } catch (err) {
      console.warn('Supabase fetch failed, falling back to local database:', err);
    }
  }
  return getStoredPaintings();
};

export const savePainting = async (painting: Omit<Painting, 'id' | 'created_at'> & { id?: string }): Promise<Painting> => {
  const supabase = getSupabase();
  const currentList = getStoredPaintings();
  
  const normalizedPrice = isNaN(Number(painting.price)) ? 0 : Math.max(0, Number(painting.price));
  const normalizedYear = isNaN(Number(painting.year)) ? new Date().getFullYear() : Number(painting.year);
  const normalizedStatus = (painting.status?.trim().toLowerCase() === 'sold') ? 'sold' : 'available';
  const paintingType = painting.type || (painting as any).category || (painting as any).medium || 'Pichwai';
  const mediumValue = painting.medium_details?.trim() || (painting as any).medium || paintingType;

  const imagesList = Array.isArray(painting.images) && painting.images.length > 0
    ? painting.images.filter(img => typeof img === 'string' && img.trim().length > 0)
    : (painting.image_url?.trim() ? [painting.image_url.trim()] : []);
  const primaryImageUrl = painting.image_url?.trim() || imagesList[0] || '';
  if (imagesList.length === 0 && primaryImageUrl) {
    imagesList.push(primaryImageUrl);
  }

  // Determine if this is an update of an existing valid UUID in Supabase,
  // or a conversion of a mock ID (e.g. 'p1') / new painting
  const isExistingValidUuid = Boolean(painting.id && isValidUUID(painting.id));
  const finalEntityId = isExistingValidUuid ? (painting.id as string) : generateEntityId();

  let baseItem: Painting = {
    ...painting,
    id: finalEntityId,
    name: painting.name.trim(),
    description: (painting.description || '').trim(),
    size: painting.size.trim(),
    price: normalizedPrice,
    type: paintingType,
    category: paintingType,
    medium: mediumValue,
    status: normalizedStatus as PaintingStatus,
    image_url: primaryImageUrl,
    images: imagesList,
    medium_details: painting.medium_details ? painting.medium_details.trim() : mediumValue,
    year: normalizedYear,
    featured: Boolean(painting.featured),
    created_at: (painting.id && isExistingValidUuid) 
      ? (currentList.find(p => p.id === painting.id)?.created_at || new Date().toISOString()) 
      : new Date().toISOString()
  };

  if (supabase) {
    // Universal schema compatibility payload
    let payload: Record<string, any> = {
      name: baseItem.name,
      description: baseItem.description,
      size: baseItem.size,
      price: baseItem.price,
      type: baseItem.type,
      category: baseItem.category || baseItem.type,
      medium: baseItem.medium || baseItem.type,
      status: baseItem.status,
      image_url: baseItem.image_url,
      year: baseItem.year,
      featured: Boolean(baseItem.featured)
    };

    if (baseItem.images && baseItem.images.length > 0) {
      payload.images = baseItem.images;
    }

    if (baseItem.medium_details) {
      payload.medium_details = baseItem.medium_details;
    }

    let lastError: any = null;
    let success = false;

    // 1. If it has an existing valid UUID, attempt UPDATE first
    if (isExistingValidUuid) {
      for (let attempt = 0; attempt < 4; attempt++) {
        const { data, error } = await supabase
          .from('paintings')
          .update(payload)
          .eq('id', finalEntityId)
          .select();

        if (!error && data && data.length > 0) {
          success = true;
          baseItem.id = data[0].id || finalEntityId;
          console.log('[Supabase Painting Update Success]:', baseItem.name, 'UUID:', baseItem.id);
          break;
        }

        if (!error && (!data || data.length === 0)) {
          // Row was not found in Supabase. Fall back to INSERT below.
          break;
        }

        lastError = error;
        const errMsg = (error?.message || '').toLowerCase();
        if (error && (error.code === 'PGRST204' || error.code === '42703' || errMsg.includes('column') || errMsg.includes('does not exist'))) {
          const optionalCols = ['images', 'medium_details', 'medium', 'category', 'year', 'featured', 'description'];
          let fixed = false;
          for (const col of optionalCols) {
            if (payload[col] !== undefined && (errMsg.includes(col) || errMsg.includes(`'${col}'`))) {
              delete payload[col];
              fixed = true;
              break;
            }
          }
          if (fixed) continue;
        }
        break;
      }
    }

    // 2. If not updated (new artwork, mock ID like 'p1', or update found 0 rows), perform INSERT with proper UUID
    if (!success) {
      // Ensure payload.id is ONLY set if it is a valid UUID, otherwise omit it so Postgres generates one
      if (isValidUUID(finalEntityId)) {
        payload.id = finalEntityId;
      } else {
        delete payload.id;
      }

      for (let attempt = 0; attempt < 5; attempt++) {
        const { data, error } = await supabase
          .from('paintings')
          .insert([payload])
          .select();

        if (!error && data && data.length > 0) {
          success = true;
          if (data[0].id) {
            baseItem.id = data[0].id;
          }
          console.log('[Supabase Painting Insert Success]:', baseItem.name, 'Assigned UUID:', baseItem.id);
          break;
        }

        lastError = error;
        const errMsg = (error?.message || '').toLowerCase();
        console.warn(`[Supabase Painting Insert Attempt ${attempt + 1}] Notice:`, error?.message);

        // Handle missing column variance (PGRST204 or 42703)
        if (error && (error.code === 'PGRST204' || error.code === '42703' || errMsg.includes('column') || errMsg.includes('does not exist'))) {
          const optionalCols = ['images', 'medium_details', 'medium', 'category', 'year', 'featured', 'description', 'id'];
          let fixed = false;
          for (const col of optionalCols) {
            if (payload[col] !== undefined && (errMsg.includes(col) || errMsg.includes(`'${col}'`))) {
              delete payload[col];
              fixed = true;
              break;
            }
          }
          if (fixed) continue;
        }

        // Handle NOT NULL constraint violations
        if (error && error.code === '23502') {
          if (errMsg.includes('medium')) payload.medium = baseItem.medium || baseItem.type || 'Pichwai';
          if (errMsg.includes('category')) payload.category = baseItem.type || 'Pichwai';
          if (errMsg.includes('type')) payload.type = baseItem.type || 'Pichwai';
          continue;
        }

        break;
      }
    }

    if (!success && lastError) {
      console.error('[Supabase Painting Save Final Error]:', lastError.message, lastError);
      throw new Error(`Supabase Database Error: ${lastError.message}${lastError.hint ? ` (${lastError.hint})` : ''}`);
    }
  }

  // Update local storage cleanly
  // If painting originally had a mock ID (e.g. 'p1'), replace that mock entry in currentList!
  const originalInputId = painting.id;
  let updatedList: Painting[];
  if (originalInputId && currentList.some(p => p.id === originalInputId)) {
    updatedList = currentList.map(p => p.id === originalInputId ? baseItem : p);
  } else if (currentList.some(p => p.id === baseItem.id)) {
    updatedList = currentList.map(p => p.id === baseItem.id ? baseItem : p);
  } else {
    updatedList = [baseItem, ...currentList];
  }
  // Update local storage cleanly wrapped in try...catch so quota limits never cause unhandled errors
  try {
    safeSetPaintingsStorage(updatedList);
  } catch (storageErr) {
    console.warn('[LocalStorage] Safe catch saving updated paintings to baru_gallery_paintings:', storageErr);
  }

  return baseItem;
};

export const togglePaintingStatus = async (id: string, newStatus: PaintingStatus): Promise<Painting | null> => {
  const currentList = getStoredPaintings();
  const target = currentList.find(p => p.id === id);
  if (!target) return null;

  const normalizedStatus = (newStatus?.trim().toLowerCase() === 'sold') ? 'sold' : 'available';

  const updatedItem: Painting = {
    ...target,
    status: normalizedStatus as PaintingStatus
  };

  const supabase = getSupabase();
  if (supabase) {
    if (isValidUUID(id)) {
      const { error } = await supabase.from('paintings').update({ status: normalizedStatus }).eq('id', id);
      if (error) {
        console.error('[Supabase Toggle Status Error]:', error.message, error);
        throw new Error(`Supabase Error: ${error.message}`);
      }
    } else {
      // If the painting had a mock ID like 'p1', persist it as a real row in Supabase!
      return await savePainting(updatedItem);
    }
  }

  const updatedList = currentList.map(p => p.id === id ? updatedItem : p);
  try {
    safeSetPaintingsStorage(updatedList);
  } catch (storageErr) {
    console.warn('[LocalStorage] Safe catch updating painting status in baru_gallery_paintings:', storageErr);
  }
  return updatedItem;
};

export const deletePaintingById = async (id: string): Promise<boolean> => {
  const supabase = getSupabase();
  if (supabase && isValidUUID(id)) {
    const { error } = await supabase.from('paintings').delete().eq('id', id);
    if (error) {
      console.error('[Supabase Delete Painting Error]:', error.message, error);
      throw new Error(`Supabase Error: ${error.message}`);
    }
  }

  const currentList = getStoredPaintings();
  const updatedList = currentList.filter(p => p.id !== id);
  try {
    safeSetPaintingsStorage(updatedList);
  } catch (storageErr) {
    console.warn('[LocalStorage] Safe catch deleting painting in baru_gallery_paintings:', storageErr);
  }
  return true;
};

export const fetchEnquiries = async (): Promise<Enquiry[]> => {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('enquiries')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data && data.length > 0) {
        try {
          localStorage.setItem(STORAGE_KEYS.ENQUIRIES, JSON.stringify(data));
        } catch (e) {
          console.warn('[LocalStorage] Safe catch saving fetched enquiries:', e);
        }
        return data as Enquiry[];
      }
    } catch (err) {
      console.warn('Supabase fetch enquiries failed:', err);
    }
  }
  return getStoredEnquiries();
};

export const createEnquiry = async (enquiryData: Omit<Enquiry, 'id' | 'created_at' | 'status'>): Promise<Enquiry> => {
  const newEnquiry: Enquiry = {
    ...enquiryData,
    id: generateEntityId(),
    status: 'new',
    created_at: new Date().toISOString()
  };

  const supabase = getSupabase();
  if (supabase) {
    try {
      const payload: any = {
        id: newEnquiry.id,
        client_name: newEnquiry.client_name,
        client_email: newEnquiry.client_email,
        client_phone: newEnquiry.client_phone || null,
        subject: newEnquiry.subject,
        message: newEnquiry.message,
        reference_image_url: newEnquiry.reference_image_url || null,
        status: newEnquiry.status,
        created_at: newEnquiry.created_at
      };
      
      // Only attach related_painting_id if it's a valid UUID
      if (
        newEnquiry.related_painting_id && 
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(newEnquiry.related_painting_id)
      ) {
        payload.related_painting_id = newEnquiry.related_painting_id;
      }

      const { error } = await supabase.from('enquiries').insert([payload]);
      if (error) console.warn('Supabase insert enquiry notice:', error.message);
    } catch (err) {
      console.warn('Supabase insert enquiry failed:', err);
    }
  }

  const currentList = getStoredEnquiries();
  const updatedList = [newEnquiry, ...currentList];
  try {
    localStorage.setItem(STORAGE_KEYS.ENQUIRIES, JSON.stringify(updatedList));
  } catch (e) {
    console.warn('[LocalStorage] Safe catch saving new enquiry:', e);
  }
  return newEnquiry;
};

export const updateEnquiryStatus = async (id: string, status: EnquiryStatus): Promise<boolean> => {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { error } = await supabase.from('enquiries').update({ status }).eq('id', id);
      if (error) console.warn('Supabase update enquiry status notice:', error.message);
    } catch (err) {
      console.warn('Supabase update enquiry status failed:', err);
    }
  }

  const currentList = getStoredEnquiries();
  const updatedList = currentList.map(e => e.id === id ? { ...e, status } : e);
  try {
    localStorage.setItem(STORAGE_KEYS.ENQUIRIES, JSON.stringify(updatedList));
  } catch (e) {
    console.warn('[LocalStorage] Safe catch updating enquiry status:', e);
  }
  return true;
};

export const resetToInitialGallery = () => {
  if (typeof window !== 'undefined') {
    try {
      safeSetPaintingsStorage([]);
    } catch (storageErr) {
      console.warn('[LocalStorage] Safe catch on reset gallery paintings:', storageErr);
    }
    try {
      localStorage.setItem(STORAGE_KEYS.ENQUIRIES, JSON.stringify(INITIAL_ENQUIRIES));
    } catch (storageErr) {
      console.warn('[LocalStorage] Safe catch on reset enquiries:', storageErr);
    }
  }
};

