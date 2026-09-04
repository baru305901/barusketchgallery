import { Painting, ArtistProfile } from '../types';

export const ARTIST_PROFILE: ArtistProfile = {
  name: "Vishal Baru",
  brandName: "Baru Sketch Gallery",
  tagline: "Painting Your Imagination",
  bioHindi: "Me bachapan se painting ke bich rha hu mere pita ji ek bohot acche klakar rhe h unse mene sikha or ghar me esa enwarment rata isliye meri ruchi bhi chitrakari me rhi mera ye manna h ki chitra kari ek anokhi kla h jo imazination ko samne la deta h ek kla kar kya dekhta h shochta h wo dusro ko dikha deta h.",
  bioEnglish: "Since my childhood, I have been passionately devoted to painting. My father was an exceptional artist; I learned the nuances of art from him and grew up in an artistic environment. This nurtured my deep devotion to fine art. I truly believe that painting is a divine art form that brings imagination to life—it allows an artist to show the world what they see, feel, and envision in their heart.",
  mobile: "+91 8000917547",
  email: "sketchartis007@gmail.com",
  address: "Masuda Road, Beawar 305901",
  city: "Beawar",
  pincode: "305901",
  state: "Rajasthan, India",
  instagram: "https://www.instagram.com/baru_sketch_gallery",
  youtube: "https://www.youtube.com/@Vishalbaru",
  facebook: "https://www.facebook.com/people/Baru-sketch-gallery/100086990053986/"
};

export const INITIAL_PAINTINGS: Painting[] = [
  {
    id: "p1",
    name: "Divine Shrinathji Pichwai in Gold Leaf & Natural Pigments",
    description: "Traditional Nathdwara style devotional Pichwai painting depicting Lord Shrinathji adorned in royal Shringar, surrounded by sacred lotus motifs and handcrafted 24K gold foil embellishments. Made using pure stone pigments on seasoned cotton cloth.",
    size: "36 x 48 inches",
    price: 32000,
    type: "Pichwai",
    status: "available",
    image_url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=80",
    created_at: "2024-02-15T10:00:00Z",
    medium_details: "Natural Stone Pigments & Gold Leaf on Handwoven Cotton Fabric",
    year: 2024,
    featured: true
  },
  {
    id: "p2",
    name: "Hyper-Realistic Charcoal Portrait of an Elder",
    description: "Intricately detailed realistic charcoal and graphite artwork capturing the weathered wisdom, serene gaze, and emotional depth of a Rajasthani village elder. Rendered with ultra-fine cross-hatching and subtle tonal shifts.",
    size: "20 x 26 inches",
    price: 14500,
    type: "Sketch",
    status: "available",
    image_url: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1000&q=80",
    created_at: "2024-01-20T14:30:00Z",
    medium_details: "Nitram Charcoal, Staedtler Graphite on 300 GSM Fabriano Archival Paper",
    year: 2024,
    featured: true
  },
  {
    id: "p3",
    name: "Kamdhenu & Sacred Lotus Pond Pichwai",
    description: "Handcrafted Rajasthani Pichwai celebrating Kamdhenu cows amidst blooming pink lotuses and stylized Kadamba trees under a midnight sapphire sky. Symbolizes fertility, divine grace, and boundless prosperity.",
    size: "30 x 42 inches",
    price: 26500,
    type: "Pichwai",
    status: "available",
    image_url: "https://images.unsplash.com/photo-1582561074719-752d5b62b10a?auto=format&fit=crop&w=1000&q=80",
    created_at: "2024-03-01T09:15:00Z",
    medium_details: "Natural Mineral Colors, Gum Arabic on Sized Silk-Cotton Fabric",
    year: 2024,
    featured: true
  },
  {
    id: "p4",
    name: "Golden Hour at Pushkar Ghat - Transparent Watercolor",
    description: "Luminous, fluid watercolor capturing the sacred ghats of Pushkar at twilight. Highlights delicate reflections of ancient havelis in the tranquil holy water with soft washes of amber, ochre, and cobalt blue.",
    size: "22 x 30 inches",
    price: 18000,
    type: "Watercolor",
    status: "sold",
    image_url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1000&q=80",
    created_at: "2023-11-12T11:00:00Z",
    medium_details: "Winsor & Newton Professional Watercolors on 100% Cotton Arches 300 GSM Rough",
    year: 2023,
    featured: false
  },
  {
    id: "p5",
    name: "The Royal Rajput Stallion - Expressive Charcoal",
    description: "Dynamic equestrian sketch expressing the untamed spirit, muscular poise, and royal heritage of the Marwari warhorse. Created with bold energetic strokes and fine blending.",
    size: "24 x 32 inches",
    price: 16000,
    type: "Sketch",
    status: "available",
    image_url: "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=1000&q=80",
    created_at: "2024-02-28T16:45:00Z",
    medium_details: "Willow Charcoal and White Conte on Canson Toned Tan Archival Sheet",
    year: 2024,
    featured: true
  },
  {
    id: "p6",
    name: "Lord Shiva Meditative Watercolor & Ink",
    description: "Mystical spiritual artwork depicting Mahadev Shiva in deep samadhi on Mount Kailash. Blends celestial indigo watercolor bleeds with delicate Indian ink detailing on the crescent moon and sacred Trishul.",
    size: "18 x 24 inches",
    price: 12500,
    type: "Watercolor",
    status: "available",
    image_url: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=1000&q=80",
    created_at: "2024-01-10T12:00:00Z",
    medium_details: "Handmade Artists' Watercolors & Waterproof Japanese Ink on Saunders Waterford",
    year: 2024,
    featured: false
  },
  {
    id: "p7",
    name: "Vrindavan Raas Leela Miniature Painting",
    description: "Intricate Rajput miniature composition illustrating Radha Krishna surrounded by dancing Gopis in the moonlit groves of Vrindavan. Featuring micro-brush squirrel hair line work and pure silver dust.",
    size: "16 x 22 inches",
    price: 21000,
    type: "Rajput Miniature",
    status: "sold",
    image_url: "https://images.unsplash.com/photo-1579783928621-7a13d66a62d1?auto=format&fit=crop&w=1000&q=80",
    created_at: "2023-12-05T08:30:00Z",
    medium_details: "Stone Pigments with Squirrel Hair Brushes on Wasli Handmade Paper",
    year: 2023,
    featured: false
  },
  {
    id: "p8",
    name: "Courtyard of Heritage Haveli - Acrylic & Oil",
    description: "Atmospheric architectural study of a sun-drenched Marwar haveli with carved sandstone jharokhas, fluttering pigeons, and antique brass lanterns cast in dramatic chiaroscuro lighting.",
    size: "28 x 36 inches",
    price: 24000,
    type: "Acrylic",
    status: "available",
    image_url: "https://images.unsplash.com/photo-1579541814924-49fef17c5be5?auto=format&fit=crop&w=1000&q=80",
    created_at: "2024-02-05T15:20:00Z",
    medium_details: "Heavy Body Acrylics & Glazing Oils on Stretched Linen Canvas",
    year: 2024,
    featured: true
  }
];

export const INITIAL_ENQUIRIES = [
  {
    id: "enq-101",
    client_name: "Vikramaditya Rathore",
    client_email: "vikram.rathore@example.com",
    client_phone: "+91 9829012345",
    subject: "Custom Pichwai",
    message: "Namaste Vishal ji, we are looking for a large 5x4 feet Shrinathji Annakoot Pichwai painting with 24K gold foil for our new prayer room in Jaipur. Could you please share availability and custom timeframes?",
    related_painting_id: "p1",
    related_painting_name: "Divine Shrinathji Pichwai in Gold Leaf",
    reference_image_url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80",
    status: "new" as const,
    created_at: "2024-03-02T11:20:00Z"
  },
  {
    id: "enq-102",
    client_name: "Ananya Sharma",
    client_email: "ananya.sharma92@example.com",
    client_phone: "+91 9711223344",
    subject: "Custom Portrait",
    message: "Hi Vishal, I loved your charcoal portraits! I want to gift a hyper-realistic couple charcoal sketch for my parents' 30th anniversary. I have attached their vintage wedding photo.",
    related_painting_id: "p2",
    related_painting_name: "Hyper-Realistic Charcoal Portrait of an Elder",
    reference_image_url: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80",
    status: "contacted" as const,
    created_at: "2024-02-28T09:45:00Z"
  }
];
