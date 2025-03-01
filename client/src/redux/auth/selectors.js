

export const isAuthenticated = (state) => state?.auth?.isAuthenticated;

export const getToken = (state) => state.auth.token;



export const getUserEmail = (state) => state.auth.userEmail;


export const selectAuthError = (state) => state.auth.error;