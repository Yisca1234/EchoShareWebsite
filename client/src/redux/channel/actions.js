import {
  SUCCESS_CHANNELS,
  SUCCESS_GET_CHANNEL,
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

export const getChannelSuccess = (channel, channelId) => ({
  type: SUCCESS_GET_CHANNEL,
  payload: { channel, channelId },
});



// get popular and random channels for home page
export const getChannels = (userId) => async (dispatch) =>{
  const response = await apiClient.post('/user/getChannelsHome',{ userId });
  await dispatch(channelsSuccess(response.data.popularChannels, response.data.randomChannels));
}

// get the details and posts of a channel to channelpage
export const getChannel = (channelId) => async (dispatch) =>{
  //console.log('channelId', channelId);
  try{
    const response = await apiClient.get(`/channel/${channelId}`);
    await dispatch(getChannelSuccess(response.data.channel, channelId));
  } catch (error) {

  }
  
}


