import { Painting, Enquiry, PaintingStatus, EnquiryStatus } from '../types';
import { INITIAL_PAINTINGS, INITIAL_ENQUIRIES } from '../data/initialData';
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
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
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

// Initialize LocalStorage with initial data if empty
const getStoredPaintings = (): Painting[] => {
  if (typeof window === 'undefined') return INITIAL_PAINTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PAINTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PAINTINGS, JSON.stringify(INITIAL_PAINTINGS));
      return INITIAL_PAINTINGS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading stored paintings', e);
    return INITIAL_PAINTINGS;
  }
};

const getStoredEnquiries = (): Enquiry[] => {
  if (typeof window === 'undefined') return INITIAL_ENQUIRIES;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ENQUIRIES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ENQUIRIES, JSON.stringify(INITIAL_ENQUIRIES));
      return INITIAL_ENQUIRIES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading stored enquiries', e);
    return INITIAL_ENQUIRIES;
  }
};

export const fetchPaintings = async (): Promise<Painting[]> => {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('paintings')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data && data.length > 0) {
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
        // Sync local storage with latest remote records
        localStorage.setItem(STORAGE_KEYS.PAINTINGS, JSON.stringify(mappedData));
        return mappedData;
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

  const baseItem: Painting = {
    ...painting,
    id: painting.id || generateEntityId(),
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
    created_at: painting.id ? (currentList.find(p => p.id === painting.id)?.created_at || new Date().toISOString()) : new Date().toISOString()
  };

  if (supabase) {
    const isUpdate = Boolean(painting.id && isValidUUID(painting.id));
    
    // Initial payload containing type, category, and medium for universal schema compatibility
    let payload: Record<string, any> = {
      name: baseItem.name,
      description: baseItem.description,
      size: baseItem.size,
      price: baseItem.price,
      type: baseItem.type,
      category: baseItem.category || baseItem.type, // Satisfies schemas requiring NOT NULL on 'category'
      medium: baseItem.medium || baseItem.type,     // Satisfies schemas requiring NOT NULL on 'medium'
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

    if (!isUpdate) {
      payload.id = baseItem.id;
    }

    let lastError: any = null;
    let success = false;

    // Retry loop for any schema variances (e.g. unknown column errors)
    for (let attempt = 0; attempt < 6; attempt++) {
      const query = isUpdate
        ? supabase.from('paintings').update(payload).eq('id', baseItem.id).select()
        : supabase.from('paintings').insert([payload]).select();

      const { data, error } = await query;

      if (!error) {
        success = true;
        console.log(`[Supabase Painting ${isUpdate ? 'Update' : 'Insert'} Success]:`, baseItem.name, data);
        break;
      }

      lastError = error;
      const errMsg = (error.message || '').toLowerCase();
      console.warn(`[Supabase Painting Write Attempt ${attempt + 1}] Error:`, error.message, error);

      let adjusted = false;

      // Handle not-null violation for medium, category, or type
      if (error.code === '23502') {
        if (errMsg.includes('medium')) {
          payload.medium = baseItem.medium || baseItem.type || 'Pichwai';
          adjusted = true;
        }
        if (errMsg.includes('category')) {
          payload.category = baseItem.type || 'Pichwai';
          adjusted = true;
        }
        if (errMsg.includes('type')) {
          payload.type = baseItem.type || 'Pichwai';
          adjusted = true;
        }
      }

      // Handle missing / undefined column errors (PGRST204 or 42703)
      if (error.code === 'PGRST204' || error.code === '42703' || errMsg.includes('column') || errMsg.includes('does not exist')) {
        const optionalCols = ['images', 'medium_details', 'medium', 'category', 'type', 'year', 'featured', 'description'];
        for (const col of optionalCols) {
          if (payload[col] !== undefined && (errMsg.includes(col) || errMsg.includes(`'${col}'`) || errMsg.includes(`"${col}"`))) {
            delete payload[col];
            adjusted = true;
            break;
          }
        }
      }

      if (!adjusted) {
        // If couldn't identify specific fix, stop retrying
        break;
      }
    }

    if (!success && lastError) {
      console.error('[Supabase Painting Save Final Error]:', lastError.message, lastError);
      throw new Error(`Supabase Database Error: ${lastError.message}${lastError.hint ? ` (${lastError.hint})` : ''}`);
    }
  }

  // Update local storage
  if (painting.id) {
    const updatedList = currentList.map(p => p.id === baseItem.id ? baseItem : p);
    localStorage.setItem(STORAGE_KEYS.PAINTINGS, JSON.stringify(updatedList));
  } else {
    const updatedList = [baseItem, ...currentList];
    localStorage.setItem(STORAGE_KEYS.PAINTINGS, JSON.stringify(updatedList));
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
  if (supabase && isValidUUID(id)) {
    const { error } = await supabase.from('paintings').update({ status: normalizedStatus }).eq('id', id);
    if (error) {
      console.error('[Supabase Toggle Status Error]:', error.message, error);
      throw new Error(`Supabase Error: ${error.message}`);
    }
  }

  const updatedList = currentList.map(p => p.id === id ? updatedItem : p);
  localStorage.setItem(STORAGE_KEYS.PAINTINGS, JSON.stringify(updatedList));
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
  localStorage.setItem(STORAGE_KEYS.PAINTINGS, JSON.stringify(updatedList));
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
        localStorage.setItem(STORAGE_KEYS.ENQUIRIES, JSON.stringify(data));
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
  localStorage.setItem(STORAGE_KEYS.ENQUIRIES, JSON.stringify(updatedList));
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
  localStorage.setItem(STORAGE_KEYS.ENQUIRIES, JSON.stringify(updatedList));
  return true;
};

export const resetToInitialGallery = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.PAINTINGS, JSON.stringify(INITIAL_PAINTINGS));
    localStorage.setItem(STORAGE_KEYS.ENQUIRIES, JSON.stringify(INITIAL_ENQUIRIES));
  }
};

