// src/config/api.ts

const USE_LOCAL = true;

export const API_BASE_URL = USE_LOCAL
  ? 'http://192.168.0.18:3000'
  : 'https://oursay.onrender.com';