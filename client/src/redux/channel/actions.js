import {
  SUCCESS_CHANNELS,
  LOGOUT,
} from './actionTypes';
import apiClient from '../../utils/apiClient';


export const logout2 = () => ({
  type: LOGOUT,
});

export const channelsSuccess = (popularChannels, randomChannels) => ({
  type: SUCCESS_CHANNELS,
  payload: { popularChannels, randomChannels },
});




export const getChannels = (userId) => async (dispatch) =>{
  const response = await apiClient.post('/user/getChannelsHome',{ userId });
  await dispatch(channelsSuccess(response.data.popularChannels, response.data.randomChannels));
}

