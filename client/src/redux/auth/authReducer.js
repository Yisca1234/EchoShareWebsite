import {
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  LOGOUT,
  REGISTER_SUCCESS,
  REGISTER_FAILURE,
} from './actionTypes';

const initialState = {
  isAuthenticated: false,
  userEmail: null,
  error: null,
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        userEmail: action.payload.userEmail,
        error: null,
      };

    case LOGIN_FAILURE:
      return {
        ...state,
        isAuthenticated: false,
        userEmail: null,
        error: action.payload.error,
      };

    case LOGOUT:
      return initialState;

    case REGISTER_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        userEmail: action.payload.userEmail,
        error: null,
      };

    case REGISTER_FAILURE:
      return {
        ...state,
        isAuthenticated: false,
        userEmail: null,
        error: action.payload.error,
      };

    default:
      return state;
  }
};

export default authReducer;