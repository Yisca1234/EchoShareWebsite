import {
  LOGOUT,
  SUCCESS_CREATE_COMMENT,
  GET_COMMENTS,
} from './actionTypes';

const initialState = {};

const commentReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_COMMENTS:
      const {postId, comments} = action.payload;
      return {
        ...state, 
        [postId]: [
          ...comments.reverse(),
        ]
      };
    
    case LOGOUT:
      return initialState;

    case SUCCESS_CREATE_COMMENT:
      const {comment} = action.payload;
      const {post} = comment;
      return{
        ...state,
        [post]: [
          ...[comment],
          ...(state[post] || []),
        ]
      }
      
    default:
      return state;
  }
};

export default commentReducer;