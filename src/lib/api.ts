import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface StorageInfo {
  used: number; // in GB
  total: number; // in GB
  isPremium: boolean;
}

export interface FileItem {
  id: string;
  name: string;
  size: number;
  date: string;
  driveLink: string;
}

export interface DownloadItem {
  id: string;
  fileName: string;
  fileSize: number;
  progress: number;
}

// Get storage information
export const getStorageInfo = async (): Promise<StorageInfo> => {
  const response = await api.get('/storage');
  return response.data;
};

// Get list of files
export const getFiles = async (): Promise<FileItem[]> => {
  const response = await api.get('/files');
  return response.data;
};

// Get active downloads
export const getActiveDownloads = async (): Promise<DownloadItem[]> => {
  const response = await api.get('/downloads');
  return response.data;
};

// Start a new download
export const startDownload = async (magnetLink: string): Promise<{ success: boolean; message: string }> => {
  const socketId = "socket-id"; // This should be replaced with actual socket ID when implementing socket.io
  const response = await api.post('/download', { magnetLink, socketId });
  return response.data;
};

// Delete a file
export const deleteFile = async (fileId: string): Promise<{ success: boolean }> => {
  const response = await api.delete(`/files/${fileId}`);
  return response.data;
};

// Cancel a download
export const cancelDownload = async (downloadId: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.post(`/downloads/${downloadId}/cancel`);
  return response.data;
};

export default api;
