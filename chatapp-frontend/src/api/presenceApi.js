import axiosInstance from './axios';

export const presenceApi = {
  // Lấy trạng thái online/offline của một user
  isUserOnline: async (userId) => {
    try {
      const response = await axiosInstance.get(`/api/presence/online/${userId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Lỗi lấy trạng thái online:', error);
      return false; // Mặc định là offline nếu có lỗi
    }
  },

  // Lấy trạng thái online/offline của nhiều user cùng lúc
  getMultipleUsersStatus: async (userIds) => {
    try {
      const promises = userIds.map(userId => presenceApi.isUserOnline(userId));
      const results = await Promise.all(promises);
      
      // Trả về object với userId làm key và status làm value
      const statusMap = {};
      userIds.forEach((userId, index) => {
        statusMap[userId] = results[index];
      });
      
      return statusMap;
    } catch (error) {
      console.error('❌ Lỗi lấy trạng thái nhiều user:', error);
      return {};
    }
  }
};
