// src/config/api.ts

export const API_BASE_URL = __DEV__
  ? 'http://192.168.0.18:3000' // 👈 your laptop IP
  : 'https://api.oursay.ie';