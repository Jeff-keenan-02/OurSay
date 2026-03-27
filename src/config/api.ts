// src/config/api.ts

const USE_LOCAL = false;

export const API_BASE_URL = USE_LOCAL
  ? 'http://192.168.0.180:3000'
  : 'https://oursay-0ixb.onrender.com';
  