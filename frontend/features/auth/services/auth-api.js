import axios from 'axios';
import { prepareImageForUpload } from '../../../hooks/helper';
import { Platform } from 'react-native';

const api = axios.create({
  baseURL: 'http://172.20.10.3:3000/',
  withCredentials: true, 
});

export const authApi = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (userData) => {
    const formData = new FormData();
    
    for (const key of Object.keys(userData)) {
      if (key === 'photo' && userData.photo) {
        const fileToUpload = await prepareImageForUpload(
          userData.photo.uri,
          userData.photo.name,
          userData.photo.type
        );
        formData.append('photo', fileToUpload);
        
      } else {
        formData.append(key, userData[key]);
      }
    }

    const response = await api.post('/auth/signup', formData, {
      headers: { 
        Accept: 'application/json',
        ...(Platform.OS !== 'web' && { 'Content-Type': 'multipart/form-data' }) 
      },
    });
    return response.data;
  },

  verifySession: async () => {
    const response = await api.get('/auth/verify');
    return response.data;
  },

  logout: async () => {
    const response = await api.get('/auth/logout');
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, newPassword) => {
    const response = await api.post(`/auth/reset-password/${token}`, { password: newPassword });
    return response.data;
  },

  getUserDetails: async () => {
    const response = await api.get('/auth/user/details');
    return response.data;
  },

  updateUserProfile: async (profileData) => {
    const response = await api.put('/auth/user/profile', profileData);
    return response.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/auth/user/password', { currentPassword, newPassword });
    return response.data;
  },

  getAllUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  getAllUsersWithTreeRole: async () => {
    const response = await api.get('/admin/users/tree-roles');
    return response.data;
  },

  validateUser: async (userId) => {
    const response = await api.put(`/admin/users/${userId}/validate`);
    return response.data;
  },

  makeAdmin: async (userId) => {
    const response = await api.put(`/admin/users/${userId}/make-admin`);
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  updateTreeRole: async (userId, role) => {
    const response = await api.put(`/admin/users/${userId}/tree-role`, { role });
    return response.data;
  }
};