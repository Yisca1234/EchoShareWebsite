import {
  SUCCESS_CHANNELS,
  LOGOUT,
} from './actionTypes';

const initialState = {
  popularChannels: [],
  randomChannels: [],
};

const postReducer = (state = initialState, action) => {
  switch (action.type) {
    case SUCCESS_CHANNELS:
      return{
        popularChannels: action.payload.popularChannels,
        randomChannels: action.payload.randomChannels,
      }
    
    case LOGOUT:
      return initialState;
    
    default:
      return state;
  }
}

export default postReducer


