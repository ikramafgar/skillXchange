import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://skill-x-change.onrender.com',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a response interceptor to handle authentication errors
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the error is due to authentication (401)
    if (error.response && error.response.status === 401) {
      // Clear any local auth state if needed
      // console.log('Authentication error detected');
      
    }
    return Promise.reject(error);
  }
);

export default instance;