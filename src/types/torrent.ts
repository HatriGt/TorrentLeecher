// Download item types
export interface DownloadItem {
  id: string;
  fileName: string;
  fileSize: number;
  progress: number;
  status: "queued" | "downloading" | "processing" | "completed" | "error" | "cancelled";
}

// File item types
export interface FileItem {
  id: string;
  name: string;
  size: number;
  date: string;
  isFolder: boolean;
  driveLink: string;
  parentFolder?: string;
  path?: string;
  children?: FileItem[];
}

// Storage info types
export interface StorageInfo {
  used: number; // in GB
  total: number; // in GB
  isPremium: boolean;
}

export interface FolderStructure {
  id: string;
  name: string;
  isFolder: boolean;
  driveLink: string;
  children?: FolderStructure[];
}
