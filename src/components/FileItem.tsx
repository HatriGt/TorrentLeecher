import { useState } from "react";
import { File, Folder, ExternalLink, Download, Play, Music, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatFileSize, formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { DriveItem } from "@/types/torrent";
import VideoPlayer from "./VideoPlayer";
import AudioPlayer from "./AudioPlayer";
import ImageViewer from "./ImageViewer";

interface FileItemProps {
  file: DriveItem;
  onFolderClick: (folder: DriveItem) => void;
}

const FileItem = ({ file, onFolderClick }: FileItemProps) => {
  const [isHovered, setIsHovered] = useState(false);
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

  const handleClick = () => {
    if (isFolder) {
      onFolderClick(file);
    } else if (isImage) {
      setIsImageOpen(true);
    }
  };

  const handleDoubleClick = () => {
    if (isVideo) {
      setIsVideoOpen(true);
    } else if (isAudio) {
      setIsAudioOpen(true);
    } else if (isImage) {
      setIsImageOpen(true);
    }
  };

  const handleOpenLink = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handlePlayMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isVideo) {
      setIsVideoOpen(true);
    } else if (isAudio) {
      setIsAudioOpen(true);
    } else if (isImage) {
      setIsImageOpen(true);
    }
  };

  return (
    <>
      <div
        className="grid grid-cols-12 gap-4 px-6 py-2 hover:bg-accent/5 cursor-pointer group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
      >
        <div className="col-span-6 flex items-center space-x-3">
          <div className="flex-shrink-0">
            {isFolder ? (
              <Folder className="h-5 w-5 text-blue-500" />
            ) : isVideo ? (
              <Play className="h-5 w-5 text-green-500" />
            ) : isAudio ? (
              <Music className="h-5 w-5 text-purple-500" />
            ) : isImage ? (
              <Image className="h-5 w-5 text-pink-500" />
            ) : (
              <File className="h-5 w-5 text-gray-500" />
            )}
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
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {(isVideo || isAudio || isImage) && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                onClick={handlePlayMedia}
                title={isVideo ? "Play video" : isAudio ? "Play audio" : "View image"}
              >
                <Play className="h-4 w-4" />
              </Button>
            )}
            {file.webViewLink && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                onClick={handleOpenLink}
                title="Open in Google Drive"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
            {!isFolder && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                onClick={handleDownload}
                title="Download file"
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {isVideo && (
        <VideoPlayer
          isOpen={isVideoOpen}
          onClose={() => setIsVideoOpen(false)}
          videoUrl={file.id ? getMediaUrl(file.id) : ''}
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
    </>
  );
};

export default FileItem;
