export const ENV = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  GOOGLE_MAPS_KEY: import.meta.env.VITE_GOOGLE_MAPS_KEY || '',
  IS_DEV: import.meta.env.DEV,
} as const;
