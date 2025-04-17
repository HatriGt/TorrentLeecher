import { useState, useCallback } from "react";
import { File, Folder, ExternalLink, Download, Play, Music, Image, MoreHorizontal, Check, FileText, Film, FileImage } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatFileSize, formatDate, cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { DriveItem } from "@/types/torrent";
import VideoPlayer from "./VideoPlayer";
import AudioPlayer from "./AudioPlayer";
import ImageViewer from "./ImageViewer";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FileItemProps {
  file: DriveItem;
  viewMode: "grid" | "list";
  onFolderClick: (folder: DriveItem) => void;
  isSelected: boolean;
  onSelect: (multiSelect: boolean) => void;
}

const FileItem = ({ file, viewMode, onFolderClick, isSelected, onSelect }: FileItemProps) => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [isAudioOpen, setIsAudioOpen] = useState(false);
  const [isImageOpen, setIsImageOpen] = useState(false);
  const { toast } = useToast();

  const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
  const isVideo = file.mimeType?.includes('video/') || file.name.match(/\.(mp4|mkv|avi|mov|wmv|flv|webm)$/i);
  const isAudio = file.mimeType?.includes('audio/') || file.name.match(/\.(mp3|wav|ogg|flac|aac|m4a)$/i);
  const isImage = file.mimeType?.includes('image/') || file.name.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i);
  const formattedSize = file.size ? formatFileSize(parseInt(file.size)) : '-';
  const formattedDate = file.modifiedTime ? formatDate(file.modifiedTime) : 'Today';

  const getMediaUrl = (fileId: string) => {
    return `${import.meta.env.VITE_API_URL}/media/${fileId}`;
  };

  const handleClick = (e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      onSelect(true);
    } else {
      onSelect(false);
    }
  };

  const handleDoubleClick = () => {
    if (isFolder) {
      onFolderClick(file);
    } else if (isVideo) {
      setIsVideoOpen(true);
    } else if (isAudio) {
      setIsAudioOpen(true);
    } else if (isImage) {
      setIsImageOpen(true);
    }
  };

  const handleOpenLink = () => {
    if (file.webViewLink) {
      window.open(file.webViewLink, "_blank", "noopener,noreferrer");
    } else {
      toast({
        title: "Error",
        description: "Drive link not available for this file",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    if (file.id) {
      const downloadUrl = `${import.meta.env.VITE_API_URL}/downloadfile/${file.id}`;
      window.open(downloadUrl, '_blank');
    } else {
      toast({
        title: "Error",
        description: "Download link not available",
        variant: "destructive",
      });
    }
  };

  const handlePlayMedia = () => {
    if (isVideo) {
      setIsVideoOpen(true);
    } else if (isAudio) {
      setIsAudioOpen(true);
    } else if (isImage) {
      setIsImageOpen(true);
    }
  };

  const FileIcon = useCallback(() => {
    const iconClass = "h-5 w-5";
    if (isFolder) return <Folder className={cn(iconClass, "text-blue-500")} />;
    if (isVideo) return <Film className={cn(iconClass, "text-green-500")} />;
    if (isAudio) return <Music className={cn(iconClass, "text-purple-500")} />;
    if (isImage) return <FileImage className={cn(iconClass, "text-pink-500")} />;
    return <FileText className={cn(iconClass, "text-gray-500")} />;
  }, [isFolder, isVideo, isAudio, isImage]);

  const renderContextMenu = (children: React.ReactNode) => (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        {(isVideo || isAudio || isImage) && (
          <ContextMenuItem onClick={handlePlayMedia}>
            Open
          </ContextMenuItem>
        )}
        {file.webViewLink && (
          <ContextMenuItem onClick={handleOpenLink}>
            Open in Google Drive
          </ContextMenuItem>
        )}
        {!isFolder && (
          <ContextMenuItem onClick={handleDownload}>
            Download
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );

  if (viewMode === "grid") {
    return renderContextMenu(
      <div
        className={cn(
          "group relative p-4 rounded-lg hover:bg-accent/5 cursor-pointer transition-all duration-200",
          isSelected && "bg-accent/10 ring-1 ring-accent"
        )}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
      >
        <div className="flex flex-col items-center space-y-3">
          <div className="relative">
            <div className={cn(
              "p-2 rounded-lg transition-colors",
              isSelected ? "bg-accent/10" : "group-hover:bg-accent/5"
            )}>
              <FileIcon />
            </div>
            {isSelected && (
              <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full p-1">
                <Check className="h-3 w-3" />
              </div>
            )}
          </div>
          <div className="w-full text-center space-y-0.5">
            <span className="text-sm font-medium text-foreground line-clamp-2">
              {file.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {formattedSize}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return renderContextMenu(
    <div
      className={cn(
        "group relative grid grid-cols-12 gap-4 px-6 py-2 hover:bg-accent/5 cursor-pointer transition-colors duration-200",
        isSelected && "bg-accent/10"
      )}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      <div className="col-span-6 flex items-center space-x-3">
        <div className={cn(
          "p-1 rounded transition-colors",
          isSelected ? "bg-accent/10" : "group-hover:bg-accent/5"
        )}>
          <FileIcon />
        </div>
        <span className="text-sm font-medium text-foreground truncate">
          {file.name}
        </span>
      </div>
      <div className="col-span-2 text-right">
        <span className="text-sm text-muted-foreground">{formattedSize}</span>
      </div>
      <div className="col-span-3 text-right">
        <span className="text-sm text-muted-foreground">{formattedDate}</span>
      </div>
      <div className="col-span-1 flex justify-end">
        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-accent/10"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {(isVideo || isAudio || isImage) && (
                <DropdownMenuItem onClick={handlePlayMedia} className="gap-2">
                  <Play className="h-4 w-4" />
                  <span>Open</span>
                </DropdownMenuItem>
              )}
              {file.webViewLink && (
                <DropdownMenuItem onClick={handleOpenLink} className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  <span>Open in Google Drive</span>
                </DropdownMenuItem>
              )}
              {!isFolder && (
                <DropdownMenuItem onClick={handleDownload} className="gap-2">
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {isVideo && (
        <VideoPlayer
          isOpen={isVideoOpen}
          onClose={() => setIsVideoOpen(false)}
          videoUrl={file.id ? `https://drive.google.com/file/d/${file.id}/view` : ''}
          title={file.name}
        />
      )}

      {isAudio && (
        <AudioPlayer
          isOpen={isAudioOpen}
          onClose={() => setIsAudioOpen(false)}
          audioUrl={file.id ? getMediaUrl(file.id) : ''}
          title={file.name}
        />
      )}

      {isImage && (
        <ImageViewer
          isOpen={isImageOpen}
          onClose={() => setIsImageOpen(false)}
          imageUrl={file.id ? getMediaUrl(file.id) : ''}
          title={file.name}
        />
      )}
    </div>
  );
};

export default FileItem;
