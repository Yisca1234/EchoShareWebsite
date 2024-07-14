import {
  VIEW_SUCCESS,
  SUCCESS_GET_POSTS,
  FAILURE_GET_POSTS,
  SUCCESS_LIKE_ADDED,
  SUCCESS_LIKE_REMOVED,
  LOGOUT
} from './actionTypes';

const initialState = {
  loaded: false,
  posts: {
    foryou: [],
    following: [],
  },
  error: null,
};

const postReducer = (state = initialState, action) => {
  switch (action.type) {
    case SUCCESS_GET_POSTS:
      //console.log('here');
      if(action.payload.typeOfSort==='foryou'){
        return {
          ...state,
          loaded: true,
          posts: {
            ...state.posts,
            foryou: action.payload.posts ? [...state.posts.foryou, ...action.payload.posts] : [...state.posts.foryou]
          },
          error: null,
        };        

      } else {
        return {
          ...state,
          loaded: true,
          posts: {
            ...state.posts,
            following: action.payload.posts ? [...state.posts.following, ...action.payload.posts] : [...state.posts.following]
          },
          error: null,
        };
        
      }
    case FAILURE_GET_POSTS:
      return {
        ...state,
        error: action.payload.error,
      }

    case SUCCESS_LIKE_ADDED:
      console.log('hh');
      return {
        ...state,
        posts: {
          ...state.posts,
          foryou: state.posts.foryou.map(post => 
            post._id === action.payload.postId
            ? { 
              ...post, 
              data: { 
                ...post.data, 
                likes: [
                  ...post.data.likes, 
                  action.payload.userId
                ]
              } 
            }
            : post
          ),
          following: state.posts.following.map(post => 
            post._id === action.payload.postId
            ? { 
              ...post, 
              data: { 
                ...post.data, 
                likes: [
                  ...post.data.likes, 
                  action.payload.userId
                ]
              } 
            }
            : post
          ),
        },
      };

    case SUCCESS_LIKE_REMOVED:
      return {
        ...state,
        posts: {
          foryou: state.posts.foryou.map(post => 
            post._id === action.payload.postId
            ? { 
              ...post, 
              data: { 
                ...post.data, 
                likes: post.data.likes.filter(userId => userId !== action.payload.userId)
              }
            }
            : post
          ),
          following: state.posts.following.map(post => 
            post._id === action.payload.postId
            ? { 
              ...post, 
              data: { 
                ...post.data, 
                likes: post.data.likes.filter(userId => userId !== action.payload.userId)
              }
            }
            : post
          ),
        },
      };


    case VIEW_SUCCESS:

      return {
        ...state,
        posts: {
          foryou: state.posts.foryou.map(post => 
            post._id === action.payload.postId
            ? { 
              ...post, 
              data: { 
                ...post.data, 
                views: [action.payload.userId ,...post.data.views]
              }
            }
            : post
          ),
          following: state.posts.following.map(post => 
            post._id === action.payload.postId
            ? { 
              ...post, 
              data: { 
                ...post.data, 
                views: [action.payload.userId ,...post.data.views]
              }
            }
            : post
          ),
        },
      };

    case LOGOUT:
      return initialState;
    
    default:
      return state;
  }
}

export default postReducer


