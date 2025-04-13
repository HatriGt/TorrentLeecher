
import { supabase } from "@/integrations/supabase/client";
import { DownloadItem, FileItem } from "@/types/torrent";

// Start a new download
export const startDownload = async (magnetLink: string): Promise<{ success: boolean; message: string; id?: string }> => {
  try {
    // Extract file name from magnet link (simplified version)
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
      status: item.status as "queued" | "downloading" | "processing" | "completed" | "error" | "cancelled"
    }));
  } catch (error) {
    console.error("Error fetching active downloads:", error);
    return [];
  }
};

// Get completed files
export const getCompletedFiles = async (): Promise<FileItem[]> => {
  try {
    const { data, error } = await supabase
      .from("files")
      .select("*")
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Map the database response to our FileItem type
    // Note: The database doesn't have an is_folder field, so we'll handle this differently
    return data.map(item => ({
      id: item.id,
      name: item.name,
      size: item.size,
      date: item.created_at,
      // We'll assume some files are folders based on their drive_link (this is a workaround)
      // In a real application, you would have a proper column for this
      isFolder: item.name.endsWith('/') || item.drive_link.includes('folder'),
      driveLink: item.drive_link
    }));
  } catch (error) {
    console.error("Error fetching files:", error);
    return [];
  }
};

// Delete a file
export const deleteFile = async (fileId: string): Promise<{ success: boolean }> => {
  try {
    const { error } = await supabase
      .from("files")
      .delete()
      .eq('id', fileId);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting file:", error);
    return { success: false };
  }
};

// Cancel a download
export const cancelDownload = async (downloadId: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const { error } = await supabase
      .from("downloads")
      .update({ 
        status: "cancelled",
        completed_at: new Date().toISOString()
      })
      .eq('id', downloadId);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error("Error canceling download:", error);
    return { 
      success: false,
      message: "Failed to cancel download" 
    };
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

// Mock function to simulate upload progress for demo purposes
// In a real app, this would be handled by a WebSocket connection
export const simulateDownloadProgress = async (downloadId: string): Promise<void> => {
  let progress = 0;
  const interval = setInterval(async () => {
    progress += Math.floor(Math.random() * 10) + 1;
    
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      
      // Update the download status to completed
      await supabase
        .from("downloads")
        .update({ 
          progress: 100, 
          status: "completed",
          completed_at: new Date().toISOString()
        })
        .eq('id', downloadId);
      
      // Create a file entry for the completed download
      const { data } = await supabase
        .from("downloads")
        .select("*")
        .eq('id', downloadId)
        .single();
        
      if (data) {
        await supabase
          .from("files")
          .insert({
            download_id: data.id,
            name: data.file_name,
            size: data.file_size || Math.floor(Math.random() * 1024 * 1024 * 1024),
            drive_link: `https://drive.google.com/file/${data.id}`
          });
      }
    } else {
      // Update the download progress
      await supabase
        .from("downloads")
        .update({ 
          progress, 
          status: progress > 90 ? "processing" : "downloading" 
        })
        .eq('id', downloadId);
    }
  }, 2000);
};
