
import {
  SUCCESS_AVATAR,
  USER_SUCCESS, 
  USER_FAILURE,
  USER_ADD_POST,
  FOLLOW_SUCCESS,
  UNFOLLOW_SUCCESS,
  DELETE_POST_SUCCESS,
  BOOKMARK_SUCCESS,
  UNBOOKMARK_SUCCESS,
  BOOKMARK_LIKE_SUCCESS,
  BOOKMARK_UNLIKE_SUCCESS,
  BOOKMARK_VIEW_SUCCESS,
  LOGOUT,
} from './actionTypes';


const initialState = {
  exists: false,
  user: null,
  error: null,
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case USER_SUCCESS:
      return {
        exists: true,
        user: action.payload.user,
        error: null,
      };
    case USER_FAILURE:
      return {
        exists: false,
        user: null,
        error: action.payload.error,
      };
    
    case LOGOUT:
      return initialState;  
  
    case USER_ADD_POST:{

      const newPost = action.payload.post;
      const updatedUser = {
        ...state.user,
        avatar: {
          ...state.user.avatar,
          posts: [newPost, ...state.user.avatar.posts]
        }
      };
      return {
        exists: true,
        user: updatedUser,
        error: null,
      };
    }
    
    case SUCCESS_AVATAR:{

      const {username, imageLink, description, phone, avatarSetDate} =  action.payload.avatar;
      const updatedAvatar = {
        ...state.user,
        data:{
          ...state.user.data,
          avatarExists: true,
        },
        avatar:{
          ...state.user.avatar,
          username,
          imageLink,
          description,
          phone,
          avatarSetDate,
        }
      };
      return{
        exists: true,
        user: updatedAvatar,
        error: null,
      }
    }

    case FOLLOW_SUCCESS: {
      const channel = action.payload.channel;
    
      const updateduser = {
        ...state.user,
        data: {
          ...state.user.data,
          following: [channel, ...state.user.data.following]
        }
      };
    
      return {
        exists: true,
        user: updateduser,
        error: null,
      };
    }
    
    case BOOKMARK_LIKE_SUCCESS: {
      const {userId, postId} = action.payload;
      console.log(userId, postId);

      const updateduser = {
        ...state.user,
        data: {
          ...state.user.data,
          bookmarkedPosts: state.user.data.bookmarkedPosts.map(post => 
            post._id === postId
            ? { 
              ...post, 
              data: { 
                ...post.data, 
                likes: [
                  ...post.data.likes, 
                  userId,
                ]
              } 
            }
            : post
          ),
        }
      };
    
      return {
        exists: true,
        user: updateduser,
        error: null,
      };
    }

    case BOOKMARK_UNLIKE_SUCCESS: {
      const {userId, postId} = action.payload;
    
      const updateduser = {
        ...state.user,
        data: {
          ...state.user.data,
          bookmarkedPosts: state.user.data.bookmarkedPosts.map(post => 
            post._id === postId
            ? { 
              ...post, 
              data: { 
                ...post.data, 
                likes: post.data.likes.filter(postUserId => postUserId !== userId),
              } 
            }
            : post
          ),
        }
      };
    
      return {
        exists: true,
        user: updateduser,
        error: null,
      };
    }

    case BOOKMARK_VIEW_SUCCESS: {
      const updatedBookmarkPosts = state.user.data.bookmarkedPosts.map(post => {
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
        user: {
          ...state.user,
          data: {
            ...state.user.data,
            bookmarkedPosts: updatedBookmarkPosts
          }
        }
      };  
    }
    
    case UNFOLLOW_SUCCESS: {

      const idchannel = action.payload.idChannel;
      const updated_user = {
        ...state.user,
        data: {
          ...state.user.data,
          following: state.user.data.following.filter(item => item._id !== idchannel)
        }
      };    
      return {
        exists: true,
        user: updated_user,
        error: null,
      };
    } 

    case DELETE_POST_SUCCESS:{
      const postId = action.payload.postId;
      const newUser = {
        ...state.user,
        avatar: {
          ...state.user.avatar,
          posts: state.user.avatar.posts.filter(item => item._id !== postId)
        }
      }; 
      return {
        exists: true,
        user: newUser,
        error: null,
      };
    }

    case BOOKMARK_SUCCESS: {
      const post = action.payload.post;
      const newUser = {
        ...state.user,
        data: {
          ...state.user.data,
          bookmarkedPosts: [{...post},...state.user.data.bookmarkedPosts]
        }
      }; 
      return {
        user: newUser,
      };

    }

    case UNBOOKMARK_SUCCESS: {
      const postId = action.payload.postId;
      const newUser = {
        ...state.user,
        data: {
          ...state.user.data,
          bookmarkedPosts: state.user.data.bookmarkedPosts.filter(item => item._id !== postId)
        }
      }; 
      return {
        user: newUser,
      };
    }

    default:
      return state;
  }
};

export default userReducer;