import {
  SUCCESS_CHANNELS,
  SUCCESS_GET_CHANNEL,
  LOGOUT,
} from './actionTypes';

const initialState = {
  popularChannels: [],
  randomChannels: [],
  channels: {},
};

const postReducer = (state = initialState, action) => {
  switch (action.type) {
    case SUCCESS_CHANNELS:
      return{
        ...state,
        popularChannels: action.payload.popularChannels,
        randomChannels: action.payload.randomChannels,
      }

    case SUCCESS_GET_CHANNEL: {
      
      return {
        ...state,
        channels: {
          ...state.channels,
          [action.payload.channelId]: {...action.payload.channel},
        }
      }
    }
    
    case LOGOUT:
      return initialState;
    
    default:
      return state;
  }
}

export default postReducer


