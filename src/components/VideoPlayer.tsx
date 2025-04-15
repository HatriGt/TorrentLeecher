import { useEffect, useRef, useState } from 'react';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface VideoPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title: string;
}

const VideoPlayer = ({ isOpen, onClose, videoUrl, title }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<Plyr>();
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Extract file ID from Google Drive URL
  const getFileId = (url: string) => {
    const match = url.match(/\/d\/([^/]+)/);
    return match ? match[1] : '';
  };

  useEffect(() => {
    if (videoRef.current && isOpen) {
      setIsLoading(true);
      setError(null);

      playerRef.current = new Plyr(videoRef.current, {
        controls: [
          'play-large',
          'play',
          'progress',
          'current-time',
          'mute',
          'volume',
          'captions',
          'settings',
          'pip',
          'airplay',
          'fullscreen',
        ],
        settings: ['captions', 'quality', 'speed'],
        quality: {
          default: 1080,
          options: [4320, 2880, 2160, 1440, 1080, 720, 576, 480, 360, 240]
        },
        speed: {
          selected: 1,
          options: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]
        },
        muted: false,
        volume: 1,
        autoplay: true,
        seekTime: 10,
        keyboard: { focused: true, global: true },
        tooltips: { controls: true, seek: true },
        displayDuration: true,
        hideControls: false,
        loadSprite: true,
        iconUrl: 'plyr.svg',
        blankVideo: 'https://cdn.plyr.io/static/blank.mp4',
        ratio: '16:9'
      });

      // Ensure video is not muted when initialized
      if (videoRef.current) {
        videoRef.current.muted = false;
        videoRef.current.volume = 1;
      }

      // Add error handling
      videoRef.current.addEventListener('error', (e) => {
        console.error('Video error:', e);
        const error = videoRef.current?.error;
        if (error) {
          let errorMessage = 'Error playing video';
          switch (error.code) {
            case 1:
              errorMessage = 'Video loading aborted';
              break;
            case 2:
              errorMessage = 'Network error while loading video';
              break;
            case 3:
              errorMessage = 'Error decoding video';
              break;
            case 4:
              errorMessage = 'Video format not supported';
              break;
          }
          setError(errorMessage);
          toast({
            title: "Playback Error",
            description: errorMessage,
            variant: "destructive",
          });
        }
      });

      // Handle loading state
      videoRef.current.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
      });

      // Handle playback errors
      videoRef.current.addEventListener('play', () => {
        setIsLoading(false);
      });

      return () => {
        if (playerRef.current) {
          playerRef.current.pause();
          playerRef.current.destroy();
        }
      };
    }
  }, [isOpen, toast]);

  const fileId = getFileId(videoUrl);
  const streamUrl = fileId ? `${import.meta.env.VITE_API_URL}/stream/${fileId}` : '';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[90vw] max-h-[90vh] p-0">
        <div className="relative w-full aspect-video bg-black">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-center p-4">
                <p className="text-red-500 font-medium">{error}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try downloading the file instead
                </p>
              </div>
            </div>
          )}
          {streamUrl && (
            <video
              ref={videoRef}
              className="w-full h-full"
              playsInline
              controls
              crossOrigin="anonymous"
              muted={isMuted}
            >
              <source src={streamUrl} type="video/mp4" />
              <track kind="captions" label="English" srcLang="en" src="" default />
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoPlayer; 