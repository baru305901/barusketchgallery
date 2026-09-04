export type PaintingType = 
  | 'Pichwai'
  | 'Watercolor'
  | 'Sketch'
  | 'Oil'
  | 'Acrylic'
  | 'Charcoal'
  | 'Rajput Miniature';

export type PaintingStatus = 'available' | 'sold';

export type EnquiryStatus = 'new' | 'contacted' | 'closed';

export interface Painting {
  id: string;
  name: string;
  description: string;
  size: string;
  price: number;
  type: PaintingType;
  category?: string;
  medium?: string;
  status: PaintingStatus;
  image_url: string;
  images?: string[];
  created_at: string;
  user_id?: string;
  medium_details?: string;
  year?: number;
  featured?: boolean;
}

export interface Enquiry {
  id: string;
  client_name: string;
  client_email: string;
  client_phone?: string;
  subject: string;
  message: string;
  reference_image_url?: string;
  related_painting_id?: string;
  related_painting_name?: string;
  status: EnquiryStatus;
  created_at: string;
}

export interface ArtistProfile {
  name: string;
  brandName: string;
  tagline: string;
  bioHindi: string;
  bioEnglish: string;
  mobile: string;
  email: string;
  address: string;
  city: string;
  pincode: string;
  state: string;
  instagram: string;
  youtube: string;
}

export interface SupabaseConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  isConfigured: boolean;
}
