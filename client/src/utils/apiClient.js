import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5000/api'  // Use server's port 5000 in development
    : 'https://app.echo-share.click/api',  // Use the production API URL
});

apiClient.interceptors.request.use(
  (config) => {
    if (!config.url.includes('/login') && !config.url.includes('/signup')) {
      const jwtToken = sessionStorage.getItem('jwtToken');
      const userId = sessionStorage.getItem('userId');
      
      config.headers['Authorization'] = `Bearer ${jwtToken}`;
      config.headers['userId'] = userId;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
