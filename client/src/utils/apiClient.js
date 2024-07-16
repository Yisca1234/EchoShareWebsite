import axios from 'axios';


const apiClient = axios.create({
  baseURL: 'https://16.170.203.43:5000/api', 
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
