import { supabase } from "@/integrations/supabase/client";
import { DownloadItem, FileItem, FolderStructure } from "@/types/torrent";
import { io, Socket } from "socket.io-client";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const WEBSOCKET_URL = import.meta.env.WEBSOCKET_URL || 'http://localhost:3000';

// WebSocket connection
let socket: Socket | null = null;

// Initialize WebSocket connection
export const initializeSocket = () => {
  if (!socket) {
    socket = io(WEBSOCKET_URL, {
      path: '/socket.io',
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      autoConnect: true,
      forceNew: true
    });

    socket.on('connect', () => {
      console.log('Connected to WebSocket server with ID:', socket?.id);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    socket.on('disconnect', (reason) => {
      console.log('Disconnected from WebSocket server:', reason);
      if (reason === 'io server disconnect') {
        // The disconnection was initiated by the server, reconnect manually
        socket?.connect();
      }
    });

    // Ensure socket is connected
    if (!socket.connected) {
      socket.connect();
    }
  }
  return socket;
};

// Helper function to organize files into folder structure
const organizeFiles = (files: FileItem[]): FolderStructure[] => {
  const root: { [key: string]: FolderStructure } = {};

  // First pass: create all folders
  files.forEach(file => {
    if (file.isFolder) {
      root[file.id] = {
        id: file.id,
        name: file.name,
        isFolder: true,
        driveLink: file.driveLink,
        children: []
      };
    }
  });

  // Second pass: organize files into their parent folders
  files.forEach(file => {
    if (!file.isFolder && file.parentFolder && root[file.parentFolder]) {
      root[file.parentFolder].children = root[file.parentFolder].children || [];
      root[file.parentFolder].children.push({
        id: file.id,
        name: file.name,
        isFolder: false,
        driveLink: file.driveLink
      });
    }
  });

  // Return only root level folders
  return Object.values(root).filter(folder => !folder.parentFolder);
};

// Start a new download
export const startDownload = async (magnetLink: string): Promise<{ success: boolean; message: string; id?: string }> => {
  try {
    // Initialize socket if not already done
    const socket = initializeSocket();
    
    // Wait for socket connection if not connected
    if (!socket.connected) {
      await new Promise((resolve) => {
        if (socket.connected) {
          resolve(true);
        } else {
          socket.once('connect', () => resolve(true));
        }
      });
    }

    // Extract file name from magnet link
    const nameMatch = magnetLink.match(/dn=([^&]+)/);
    const fileName = nameMatch ? decodeURIComponent(nameMatch[1]) : "Unknown";
    
    // Insert new download into the database
    const { data, error } = await supabase
      .from("downloads")
      .insert({
        magnet_link: magnetLink,
        file_name: fileName,
        status: "downloading",
        progress: 0
      })
      .select()
      .single();
    
    if (error) throw error;

    // Start the actual download through the backend
    const response = await fetch(`${API_BASE_URL}/download`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        magnetLink,
        socketId: socket.id,
        downloadId: data.id
      })
    });

    if (!response.ok) {
      throw new Error('Failed to start download on backend');
    }

    return { 
      success: true, 
      message: "Download started successfully", 
      id: data.id 
    };
  } catch (error) {
    console.error("Error starting download:", error);
    return { 
      success: false, 
      message: "Failed to start download. Please try again." 
    };
  }
};

// Get active downloads
export const getActiveDownloads = async (): Promise<DownloadItem[]> => {
  try {
    const { data, error } = await supabase
      .from("downloads")
      .select("*")
      .or('status.eq.downloading,status.eq.queued,status.eq.processing')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(item => ({
      id: item.id,
      fileName: item.file_name,
      fileSize: item.file_size || 0,
      progress: item.progress || 0,
      status: item.status
    }));
  } catch (error) {
    console.error("Error fetching active downloads:", error);
    return [];
  }
};

// Get completed files with folder structure
export const getCompletedFiles = async (): Promise<FolderStructure[]> => {
  try {
    const { data, error } = await supabase
      .from("files")
      .select("*")
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    const files = data.map(item => ({
      id: item.id,
      name: item.name,
      size: item.size,
      date: item.created_at,
      isFolder: item.is_folder,
      driveLink: item.drive_link,
      parentFolder: item.parent_folder,
      path: item.path
    }));

    return organizeFiles(files);
  } catch (error) {
    console.error("Error fetching files:", error);
    return [];
  }
};

// Cancel a download
export async function cancelDownload(downloadId: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/downloads/${downloadId}/cancel`, {
      method: 'POST'
    });

    if (!response.ok) {
      throw new Error('Failed to cancel download');
    }

    // Update local state through Supabase subscription
    // The backend will handle updating Supabase and emitting WebSocket events

    return { success: true };
  } catch (error) {
    console.error('Error cancelling download:', error);
    throw error;
  }
}

// Delete a file
export const deleteFile = async (fileId: string): Promise<{ success: boolean }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/files/${fileId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Failed to delete file');
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting file:", error);
    return { success: false };
  }
};

// Create a new folder
export const createFolder = async (folderName: string): Promise<{ success: boolean; message?: string; id?: string }> => {
  try {
    // Since there's no is_folder column in the database,
    // we'll create a file entry with specific formatting to represent a folder
    const folderPath = folderName.endsWith('/') ? folderName : `${folderName}/`;
    
    const { data, error } = await supabase
      .from("files")
      .insert({
        name: folderPath,
        size: 0,
        drive_link: `https://drive.google.com/drive/folders/dummy-folder-id-${Date.now()}`
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return { 
      success: true,
      id: data.id 
    };
  } catch (error) {
    console.error("Error creating folder:", error);
    return { 
      success: false,
      message: "Failed to create folder" 
    };
  }
};
