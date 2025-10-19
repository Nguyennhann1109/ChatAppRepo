import axios from "axios";

const API_URL = "http://localhost:8080/api/friends";

export const sendFriendRequest = (userId, friendId) =>
  axios.post(`${API_URL}/add`, null, { params: { userId, friendId } });

export const acceptFriend = (userId, friendId) =>
  axios.post(`${API_URL}/accept`, null, { params: { userId, friendId } });

export const rejectFriend = (userId, friendId) =>
  axios.post(`${API_URL}/reject`, null, { params: { userId, friendId } });

export const cancelRequest = (userId, friendId) =>
  axios.post(`${API_URL}/cancel`, null, { params: { userId, friendId } });

export const deleteFriend = (userId, friendId) =>
  axios.delete(`${API_URL}/delete`, { params: { userId, friendId } });

export const getFriends = (userId) =>
  axios.get(`${API_URL}/${userId}`);

export const getPendingRequests = (userId) =>
  axios.get(`${API_URL}/pending/${userId}`);
