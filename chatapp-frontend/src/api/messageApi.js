import axiosInstance from './axios';

export const messageApi = {
  // Gửi tin nhắn
  send: async (roomId, senderId, content) => {
    // Encode content as base64 (UTF-8 safe) to avoid emoji being lost if backend DB charset
    // does not support utf8mb4. Backend will store the base64 string.
    const toBase64 = (str) => {
      const bytes = new TextEncoder().encode(str);
      let binary = '';
      for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
      return btoa(binary);
    };

    const encoded = toBase64(content);
    console.log("🌐 API Call - URL:", `/api/messages?roomId=${roomId}&senderId=${senderId}`);
    console.log("🌐 API Call - Encoded Content (base64):", encoded);
    const response = await axiosInstance.post(
      `/api/messages?roomId=${roomId}&senderId=${senderId}`,
      encoded,
      { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
    );
    console.log("🌐 API Response:", response.data);
    return response.data;
  },

  // Lấy tin nhắn của room
  getByRoom: async (roomId, page = 0, size = 50) => {
    const response = await axiosInstance.get(
      `/api/messages/room/${roomId}?page=${page}&size=${size}`
    );
    return response.data;
  },

  // Sửa tin nhắn
  edit: async (messageId, editorUserId, newContent) => {
    const toBase64 = (str) => {
      const bytes = new TextEncoder().encode(str);
      let binary = '';
      for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
      return btoa(binary);
    };

    const encoded = toBase64(newContent);
    const response = await axiosInstance.put(
      `/api/messages/${messageId}?editorUserId=${editorUserId}`,
      encoded,
      { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
    );
    return response.data;
  },

  // Xóa tin nhắn (soft delete)
  softDelete: async (messageId, requesterUserId) => {
    await axiosInstance.delete(
      `/api/messages/${messageId}?requesterUserId=${requesterUserId}`
    );
  },

  // Đánh dấu đã xem
  markSeen: async (roomId, messageId, userId) => {
    const response = await axiosInstance.post(
      `/api/messages/room/${roomId}/seen/${messageId}?userId=${userId}`
    );
    return response.data;
  },

  // Upload ảnh/file
  uploadMedia: async (roomId, senderId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axiosInstance.post(
      `/api/messages/room/${roomId}/media?senderId=${senderId}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },
};