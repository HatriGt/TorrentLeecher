import { useEffect, useRef } from 'react';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface VideoPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title: string;
}

const VideoPlayer = ({ isOpen, onClose, videoUrl, title }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<Plyr>();

  // Extract file ID from Google Drive URL
  const getFileId = (url: string) => {
    const match = url.match(/\/d\/([^/]+)/);
    return match ? match[1] : '';
  };

  useEffect(() => {
    if (videoRef.current && isOpen) {
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
        autoplay: true
      });

      // Ensure video is not muted when initialized
      if (videoRef.current) {
        videoRef.current.muted = false;
        videoRef.current.volume = 1;
      }

      // Start playing when opened
      videoRef.current.play().catch(error => {
        console.error('Error auto-playing video:', error);
        // If autoplay fails, ensure it's not because of muted state
        if (videoRef.current) {
          videoRef.current.muted = false;
          videoRef.current.volume = 1;
          videoRef.current.play().catch(e => 
            console.error('Error playing unmuted video:', e)
          );
        }
      });

      // Add error handling for debugging
      videoRef.current.addEventListener('error', (e) => {
        console.error('Video error:', e);
        console.error('Error code:', videoRef.current?.error?.code);
        console.error('Error message:', videoRef.current?.error?.message);
      });

      return () => {
        if (playerRef.current) {
          playerRef.current.pause();
          playerRef.current.destroy();
        }
      };
    }
  }, [isOpen]);

  const fileId = getFileId(videoUrl);
  const streamUrl = fileId ? `${import.meta.env.VITE_API_URL}/stream/${fileId}` : '';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[90vw] max-h-[90vh] p-0">
        <div className="relative w-full aspect-video bg-black">
          {streamUrl && (
            <video
              ref={videoRef}
              className="w-full h-full"
              playsInline
              controls
              crossOrigin="anonymous"
              muted={false}
            >
              <source src={streamUrl} type="video/x-matroska" />
              <source src={streamUrl} type="video/webm" />
              <source src={streamUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoPlayer; 