export const ENV = {
  API_URL: import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:8080' : 'https://fastgo-backend-lp2j.onrender.com'),
  GOOGLE_MAPS_KEY: import.meta.env.VITE_GOOGLE_MAPS_KEY || '',
  IS_DEV: import.meta.env.DEV,
} as const;
