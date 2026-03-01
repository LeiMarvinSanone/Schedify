// api.js
// This file sets up the base configuration for all API calls to the backend
// Instead of typing 'http://localhost:5000' every time, we just import 'api' and use it

import axios from 'axios';

// Create an axios instance with the backend base URL
const api = axios.create({
  baseURL: 'http://localhost:5000', // Your backend server address
});

export default api; // Export so other files can use it