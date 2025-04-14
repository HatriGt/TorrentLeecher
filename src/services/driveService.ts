import { DriveItem, DriveResponse } from '@/types/torrent';
import api from '@/lib/api';

// Get all files and folders from Google Drive
export const getDriveFiles = async (folderId?: string, recursive = false): Promise<DriveItem[]> => {
  try {
    const params = new URLSearchParams();
    if (folderId) params.append('folderId', folderId);
    if (recursive) params.append('recursive', 'true');

    const response = await api.get<DriveResponse>(`/drive/files?${params.toString()}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch files');
    }
    return response.data.data;
  } catch (error) {
    console.error('Error fetching drive files:', error);
    throw error;
  }
};

// Get contents of a specific folder
export const getFolderContents = async (folderId: string): Promise<DriveItem[]> => {
  try {
    const response = await api.get<DriveResponse>(`/drive/folders/${folderId}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch folder contents');
    }
    return response.data.data;
  } catch (error) {
    console.error('Error fetching folder contents:', error);
    throw error;
  }
};

// Helper function to organize files into a tree structure
export const organizeFilesIntoTree = (files: DriveItem[]): DriveItem[] => {
  const fileMap = new Map<string, DriveItem>();
  const rootItems: DriveItem[] = [];

  // First pass: create map of all items
  files.forEach(file => {
    fileMap.set(file.id, { ...file, children: [] });
  });

  // Second pass: organize into tree structure
  files.forEach(file => {
    const item = fileMap.get(file.id)!;
    
    if (file.parents && file.parents.length > 0) {
      const parent = fileMap.get(file.parents[0]);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(item);
      } else {
        rootItems.push(item);
      }
    } else {
      rootItems.push(item);
    }
  });

  return rootItems;
}; 