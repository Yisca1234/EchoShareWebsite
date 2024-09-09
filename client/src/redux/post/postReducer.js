import {
  VIEW_SUCCESS,
  SUCCESS_GET_POSTS,
  FAILURE_GET_POSTS,
  SUCCESS_LIKE_ADDED,
  SUCCESS_LIKE_REMOVED,
  CHANGE_OF_FOLLOWING,
  UNFOLLOW_POSTS,
  LOGOUT,
  ADD_COMMENT,
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
      const updatedForYou = state.posts.foryou.map(post => {
        if (action.payload.updatedArray.includes(post._id)) {
          return {
            ...post,
            data: {
              ...post.data,
              views: [action.payload.userId, ...post.data.views]
            }
          };
        }
        return post;
      });
      
      const updatedFollowing = state.posts.following.map(post => {
        if (action.payload.updatedArray.includes(post._id)) {
          return {
            ...post,
            data: {
              ...post.data,
              views: [action.payload.userId, ...post.data.views]
            }
          };
        }
        return post;
      });
      return {
        ...state,
        posts: {
          foryou: updatedForYou,
          following: updatedFollowing
        }
      };

    case UNFOLLOW_POSTS:
      
      const updatedFollowing1 = state.posts.following.map(post => {
        if (!post.user._id ===action.payload.idChannel) {
          return post;
        }
      });
      return {
        ...state,
        posts: {
          foryou: updatedForYou,
          following: updatedFollowing1
        }
      };

    case CHANGE_OF_FOLLOWING:
      return {
        ...state,
        posts:{
          ...state.posts,
          following: [],
        }
      }

    case ADD_COMMENT:
      const { idComment, postId} = action.payload;
      const index1 = state.posts.foryou.findIndex(obj => obj._id == postId);
      const index2 = state.posts.following.findIndex(obj => obj._id == postId);
      const updatedArray1 = [...state.posts.foryou];
      const updatedArray2 = [...state.posts.following];
      if(index1>=0){
        updatedArray1[index1].data.comments.push(idComment);
      };
      if(index2>=0){
        updatedArray2[index2].data.comments.push(idComment);
      };
      
      return {
        ...state,
        posts: {
          foryou: updatedArray1,
          following: updatedArray2,
        }
      };




    case LOGOUT:
      return initialState;
    
    default:
      return state;
  }
}

export default postReducer


