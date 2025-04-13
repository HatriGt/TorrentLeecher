
import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Download, ExternalLink, Trash2, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatFileSize } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cancelDownload } from "@/services/downloadService";

interface DownloadProgressProps {
  downloadId: string;
  fileName: string;
  fileSize: string | number;
  initialProgress?: number;
  status: 'queued' | 'downloading' | 'processing' | 'completed' | 'error' | 'cancelled';
}

const DownloadProgress = ({
  downloadId,
  fileName,
  fileSize,
  initialProgress = 0,
  status: initialStatus,
}: DownloadProgressProps) => {
  const [progress, setProgress] = useState(initialProgress);
  const [status, setStatus] = useState<'queued' | 'downloading' | 'processing' | 'completed' | 'error' | 'cancelled'>(initialStatus);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  // Format file size if it's a number
  const formattedSize = typeof fileSize === "number" ? formatFileSize(fileSize) : fileSize;

  useEffect(() => {
    // Subscribe to changes for this specific download
    const channel = supabase
      .channel(`download-${downloadId}`)
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'downloads',
          filter: `id=eq.${downloadId}`
        }, 
        (payload) => {
          // Update local state when the download changes
          if (payload.new) {
            setProgress(payload.new.progress || 0);
            if (payload.new.status) {
              setStatus(payload.new.status as any);
            }
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [downloadId]);

  // Determine progress bar color based on status
  let progressColor = "bg-primary";
  if (status === "processing") progressColor = "bg-secondary";
  if (status === "completed") progressColor = "bg-green-500";
  if (status === "error") progressColor = "bg-red-500";
  if (status === "queued") progressColor = "bg-amber-500";
  if (status === "cancelled") progressColor = "bg-gray-500";

  const handleOpenInDrive = () => {
    // This would typically navigate to Google Drive
    // For demo purposes, we'll just show a toast
    toast({
      title: "Opening in Google Drive",
      description: `File: ${fileName}`,
    });
    // In a real app, this would use the actual Drive link:
    // window.open(driveLink, "_blank", "noopener,noreferrer");
  };

  const handleDeleteDownload = async () => {
    try {
      setIsDeleting(true);
      const result = await cancelDownload(downloadId);
      if (result.success) {
        toast({
          title: "Success",
          description: "Download canceled successfully",
        });
      } else {
        throw new Error(result.message || "Failed to cancel download");
      }
    } catch (error) {
      console.error("Failed to cancel download:", error);
      toast({
        title: "Error",
        description: typeof error === 'object' && error !== null && 'message' in error 
          ? (error as Error).message 
          : "Failed to cancel download",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full bg-card shadow-sm rounded-lg p-4 border border-border animate-slide-up hover:bg-card/80 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 mr-4">
          <h3 className="font-medium text-foreground truncate" title={fileName}>{fileName}</h3>
          <p className="text-sm text-muted-foreground">{formattedSize}</p>
        </div>
        <div className="flex items-center gap-2">
          {status === "completed" ? (
            <>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 border-primary/30 text-primary hover:text-primary hover:bg-primary/10"
                onClick={handleOpenInDrive}
              >
                <ExternalLink size={14} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                onClick={handleDeleteDownload}
                disabled={isDeleting}
              >
                <Trash2 size={14} />
              </Button>
            </>
          ) : (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10"
              onClick={handleDeleteDownload}
              disabled={isDeleting}
            >
              <Trash2 size={14} />
            </Button>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <Progress 
          value={progress} 
          className="h-2 bg-muted" 
          indicatorClassName={progressColor}
        />
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            {status === "downloading" && (
              <>
                <Download size={14} className="animate-pulse text-primary" />
                <span>Downloading... {Math.round(progress)}%</span>
              </>
            )}
            {status === "processing" && (
              <>
                <Timer size={14} className="animate-pulse text-secondary" />
                <span className="text-secondary">Processing file...</span>
              </>
            )}
            {status === "queued" && (
              <>
                <Timer size={14} className="text-amber-500" />
                <span className="text-amber-500">Queued...</span>
              </>
            )}
            {status === "completed" && (
              <span className="text-green-500">Ready to download</span>
            )}
            {status === "error" && (
              <span className="text-red-500">Download failed</span>
            )}
            {status === "cancelled" && (
              <span className="text-gray-500">Download cancelled</span>
            )}
          </div>
          {(status === "downloading" || status === "processing") && <span>{Math.round(progress)}%</span>}
        </div>
      </div>
    </div>
  );
};

export default DownloadProgress;
