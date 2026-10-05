const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const BACKEND_URL = API_URL.replace('/api', '');

// Map of any retired/deleted remote assets to active, verified boutique imagery
const URL_FALLBACKS = {
  'photo-1596568362805-4e4dbc2e69a7': 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=800',
  'photo-1490750967868-88aa4f44baee': 'https://images.unsplash.com/photo-1533616688419-b7a585564566?w=800',
};

export function getImageUrl(src) {
  if (!src) return '/placeholder.svg';

  // Check if string matches any known decommissioned external asset ID
  for (const [key, replacement] of Object.entries(URL_FALLBACKS)) {
    if (src.includes(key)) {
      return replacement;
    }
  }

  if (src.startsWith('http')) return src;
  if (src.startsWith('/uploads/')) return `${BACKEND_URL}${src}`;
  return src;
}
