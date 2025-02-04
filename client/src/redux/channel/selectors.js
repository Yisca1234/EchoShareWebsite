export const popularChannels = (state) => state.channel.popularChannels;
export const randomChannels = (state) => state.channel.randomChannels;
export const channels = (state) => state.channel.channels;
export const channel = (channelId) => (state) => state.channel.channels[channelId];
export const channelFollowers = (channelId) => (state) => state.channel.channels[channelId].Followers;
export const channelPosts = (channelId) => (state) => state.channel.channels[channelId]?.posts;
