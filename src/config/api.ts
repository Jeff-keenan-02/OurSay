// src/config/api.ts


{/* Local database */}
// export const API_BASE_URL = __DEV__
//   ? 'http://192.168.0.18:3000' // laptop IP
//   : 'https://api.oursay.ie';


{/* Render database */}
  export const API_BASE_URL = __DEV__
  ? 'http://192.168.0.18:3000'
  : 'https://your-render-service-name.onrender.com';