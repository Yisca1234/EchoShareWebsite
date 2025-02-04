

export const isExists = (state) => state?.user?.exists;

export const userSelector = (state) => state?.user;

export const userPostsSelector = (state) => state?.user?.user?.avatar?.posts;

export const getUser = (state) => state?.user?.user;

export const getUserId = (state) => state?.user?.user?._id;

export const selectUserError = (state) => state?.user?.error;


export const getUserData = (state) => state?.user?.user?.data;

export const isAvatar = (state) => state?.user?.user?.data?.avatarExists;

export const getAvatar = (state) => state?.user?.user?.avatar;

export const getAvatarImage = (state) => state?.user?.user?.avatar?.imageLink;

export const getFollowers = (state) => state?.user?.user?.avatar?.Followers;

export const getAvatarName = (state) => state?.user?.user?.avatar?.username;

export const getUserfollowing = (state) => state?.user?.user?.data?.following ?? [];

export const getBookmaredPosts = (state) => state?.user?.user?.data?.bookmarkedPosts;

export const getFollowing = (state) => state?.user?.user?.data?.following;
// export const getUserData = (state) => state.user.user.data;

// export const isAvatar = (state) => state.user.user.data.avatarExists;

// export const getAvatar = (state) => state.user.user.avatar;

// export const getAvatarImage = (state) => state.user.user.avatar.imageLink;

// export const getFollowers = (state) => state.user.user.avatar.Followers;

// export const getAvatarName = (state) => state.user.user.avatar.username;

// export const getUserfollowing = (state) => state.user.user?.data?.following ?? [];

// export const getBookmaredPosts = (state) => state.user.user.data.bookmarkedPosts;

// export const getFollowing = (state) => state.user.user.data.following;