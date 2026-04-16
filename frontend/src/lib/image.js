const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const BACKEND_URL = API_URL.replace('/api', '');

export function getImageUrl(src) {
  if (!src) return '/placeholder.svg';
  if (src.startsWith('http')) return src;
  if (src.startsWith('/uploads/')) return `${BACKEND_URL}${src}`;
  return src;
}
