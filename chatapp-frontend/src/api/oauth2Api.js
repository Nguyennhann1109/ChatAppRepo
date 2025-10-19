import axios from './axios';

const oauth2Api = {
  // Lấy thông tin user hiện tại
  getCurrentUser: () => {
    return axios.get('/api/oauth2/user');
  },

  // Đăng xuất
  logout: () => {
    return axios.get('/api/oauth2/logout');
  },

  // Redirect URLs cho OAuth2
  getGoogleLoginUrl: () => {
    return '/oauth2/authorization/google';
  },

  getFacebookLoginUrl: () => {
    return '/oauth2/authorization/facebook';
  }
};

export default oauth2Api;
