import axios from 'axios';


const apiClient = axios.create({
  baseURL: process.env.API_URL, 
});


apiClient.interceptors.request.use(
  (config) => {
    if (!config.url.includes('/login') && !config.url.includes('/signup')) {
      const jwtToken = sessionStorage.getItem('jwtToken');
      config.headers['Authorization'] = `Bearer ${jwtToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
