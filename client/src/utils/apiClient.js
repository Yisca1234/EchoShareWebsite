import axios from 'axios';


const apiClient = axios.create({
  // baseURL: 'https://app.echo-share.click/api', 
  baseURL: '/api', 
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
