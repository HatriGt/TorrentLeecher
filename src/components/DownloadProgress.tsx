import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { initializeSocket } from "@/services/downloadService";
import { formatBytes } from "@/lib/utils";
import { ChevronDown, ChevronUp, Folder, File, Download, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { cancelDownload } from "@/lib/api";

interface FileInfo {
  name: string;
  length: number;
  path: string;
}

interface DownloadStats {
  progress: string | number;
  downloadSpeed: number;
  uploaded: number;
  total: number;
  peers: number;
  files?: FileInfo[];
}

interface DownloadProgressProps {
  fileName: string;
  downloadId: string;
  fileSize?: number;
  initialProgress?: number;
  status?: "queued" | "downloading" | "processing" | "completed" | "error" | "cancelled";
  onRemove?: () => void;
}

const DownloadProgress = ({ 
  fileName, 
  downloadId, 
  initialProgress = 0, 
  status: initialStatus = "downloading",
  onRemove 
}: DownloadProgressProps) => {
  const [stats, setStats] = useState<DownloadStats>({
    progress: initialProgress,
    downloadSpeed: 0,
    uploaded: 0,
    total: 0,
    peers: 0
  });
  const [status, setStatus] = useState(initialStatus);
  const [showFiles, setShowFiles] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const socket = initializeSocket();

    const handleProgress = (data: DownloadStats) => {
      console.log('Progress update received:', data);
      setStats({
        progress: typeof data.progress === 'string' ? parseFloat(data.progress) : data.progress,
        downloadSpeed: data.downloadSpeed,
        uploaded: data.uploaded,
        total: data.total,
        peers: data.peers,
        files: data.files
      });
    };

    const handleComplete = () => {
      setStatus('completed');
      setStats(prev => ({ ...prev, progress: 100 }));
      toast({
        title: "Download Complete",
        description: "Your file has been downloaded and uploaded to Google Drive",
      });
    };

    const handleError = (error: { error: string }) => {
      console.error('Download error:', error);
      setStatus('error');
      toast({
        title: "Download Error",
        description: error.error || "An error occurred during download",
        variant: "destructive",
      });
    };

    const handleCancelled = () => {
      setStatus('cancelled');
      toast({
        title: "Download Cancelled",
        description: "The download has been cancelled",
      });
      if (onRemove) {
        onRemove();
      }
    };

    // Wait for socket connection
    if (!socket.connected) {
      socket.once('connect', () => {
        console.log('Socket connected, setting up event listeners');
        setupEventListeners();
      });
    } else {
      setupEventListeners();
    }

    function setupEventListeners() {
      socket.on('download-progress', handleProgress);
      socket.on('download-complete', handleComplete);
      socket.on('download-error', handleError);
      socket.on('download-cancelled', handleCancelled);
    }

    return () => {
      socket.off('download-progress', handleProgress);
      socket.off('download-complete', handleComplete);
      socket.off('download-error', handleError);
      socket.off('download-cancelled', handleCancelled);
    };
  }, [downloadId, onRemove, toast]);

  const handleCancel = async () => {
    try {
      setIsCancelling(true);
      const response = await cancelDownload(downloadId);

      if (!response.success) {
        throw new Error(response.message || 'Failed to cancel download');
      }

      toast({
        title: "Download Cancelled",
        description: "The download has been cancelled and files cleaned up.",
      });
    } catch (error) {
      console.error('Failed to cancel download:', error);
      toast({
        title: "Error",
        description: "Failed to cancel download. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const progress = typeof stats.progress === 'string' ? parseFloat(stats.progress) : stats.progress;
  const timeRemaining = stats.downloadSpeed > 0 
    ? ((stats.total - (stats.total * (progress / 100))) / stats.downloadSpeed)
    : 0;

  const formatTime = (seconds: number) => {
    if (seconds === 0) return 'calculating...';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  const getStatusColor = () => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'processing': return 'bg-yellow-500';
      case 'cancelled': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  const renderFileTree = (files: FileInfo[] = []) => {
    const fileTree: { [key: string]: FileInfo[] } = {};
    
    files.forEach(file => {
      const parts = file.path.split('/');
      const folder = parts.length > 1 ? parts[0] : '';
      if (!fileTree[folder]) fileTree[folder] = [];
      fileTree[folder].push(file);
    });

    return Object.entries(fileTree).map(([folder, files]) => (
      <div key={folder} className="mt-2">
        {folder && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Folder className="h-4 w-4" />
            <span>{folder}</span>
          </div>
        )}
        <div className="ml-4 space-y-1">
          {files.map(file => (
            <div key={file.path} className="flex items-center gap-2 text-sm">
              <File className="h-4 w-4" />
              <span>{file.name}</span>
              <span className="text-xs text-muted-foreground">({formatBytes(file.length)})</span>
            </div>
          ))}
        </div>
      </div>
    ));
  };

  return (
    <Card className="p-4 space-y-4 bg-gradient-to-r from-background to-muted">
      <div className="flex justify-between items-start">
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-sm">{fileName}</h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2"
              onClick={() => setShowFiles(!showFiles)}
            >
              {showFiles ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
          <div className="text-xs space-x-2 text-muted-foreground">
            {status === 'downloading' && (
              <>
                <span className="font-medium">{formatBytes(stats.downloadSpeed)}/s</span>
                <span>•</span>
                <span>{stats.peers} peers</span>
                <span>•</span>
                <span>{formatTime(timeRemaining)}</span>
              </>
            )}
            {status === 'completed' && (
              <span className="text-green-500">Download Complete</span>
            )}
            {status === 'error' && (
              <span className="text-red-500">Download Failed</span>
            )}
            {status === 'processing' && (
              <span className="text-yellow-500">Processing...</span>
            )}
            {status === 'cancelled' && (
              <span className="text-gray-500">Download Cancelled</span>
            )}
            {status === 'queued' && (
              <span>Queued</span>
            )}
          </div>
        </div>
        <div className="text-sm font-medium flex items-center gap-2">
          {progress.toFixed(1)}%
          {status === 'completed' && (
            <Button size="sm" variant="outline" className="h-7">
              <Download className="h-4 w-4" />
            </Button>
          )}
          {(status === 'downloading' || status === 'queued') && (
            <Button 
              size="sm" 
              variant="outline" 
              className="h-7 text-red-500 hover:text-red-600"
              onClick={handleCancel}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <X className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>
      
      <div className="relative pt-1">
        <div className="overflow-hidden h-2 text-xs flex rounded-full bg-muted">
          <div
            style={{ width: `${progress}%` }}
            className={cn(
              "shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all",
              getStatusColor()
            )}
          />
        </div>
      </div>
      
      <div className="flex justify-between items-center text-xs text-muted-foreground">
        <span>{formatBytes(stats.uploaded)} uploaded</span>
        <span>{formatBytes(stats.total * (progress / 100))} of {formatBytes(stats.total)}</span>
      </div>

      {showFiles && stats.files && stats.files.length > 0 && (
        <div className="mt-4 border-t pt-4">
          <div className="text-sm font-medium mb-2">Files</div>
          {renderFileTree(stats.files)}
        </div>
      )}
    </Card>
  );
};

export default DownloadProgress;
