import { AsyncStorage } from '@react-native-async-storage/async-storage';
import { baseURL } from '../../config/AppConfig';
import axios from 'axios';
import { store } from '../store';
import { refreshToken } from '../redux/actions/authActions';

const instance = axios.create({
  baseURL: baseURL,
});

async function getAuthToken() {
  const refresh = await AsyncStorage.getItem('token');
  const authTokenRequest = await store.dispatch(refreshToken(refresh));
  return authTokenRequest;
}

instance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (
      (error.response.status === 401 || error.response.status === 403) &&
      !originalRequest._retry
    ) {
      const { token } = await getAuthToken();
      originalRequest.headers.Authorization = 'Bearer ' + token;

      return axios(originalRequest);
    }

    return Promise.reject(error);
  },
);

export default instance;
