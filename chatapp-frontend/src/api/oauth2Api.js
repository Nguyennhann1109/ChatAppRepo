// OAuth2 API removed - stub to avoid import errors
const oauth2Api = {
  getGoogleLoginUrl: () => '#',
  getFacebookLoginUrl: () => '#',
  getCurrentUser: () => Promise.resolve(null),
  logout: () => Promise.resolve(null),
};

export default oauth2Api;
