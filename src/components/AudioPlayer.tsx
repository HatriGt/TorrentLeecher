import { useEffect, useRef } from 'react';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface AudioPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  audioUrl: string;
  title: string;
}

const AudioPlayer = ({ isOpen, onClose, audioUrl, title }: AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const playerRef = useRef<Plyr>();

  // Extract file ID from Google Drive URL
  const getFileId = (url: string) => {
    const match = url.match(/\/d\/([^/]+)/);
    return match ? match[1] : '';
  };

  useEffect(() => {
    if (audioRef.current && isOpen) {
      playerRef.current = new Plyr(audioRef.current, {
        controls: [
          'play-large',
          'play',
          'progress',
          'current-time',
          'mute',
          'volume',
          'settings',
        ],
        settings: ['speed'],
        speed: {
          selected: 1,
          options: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]
        }
      });

      // Start playing when opened
      audioRef.current.play().catch(error => {
        console.error('Error auto-playing audio:', error);
      });

      return () => {
        if (playerRef.current) {
          playerRef.current.pause();
          playerRef.current.destroy();
        }
      };
    }
  }, [isOpen]);

  const fileId = getFileId(audioUrl);
  const streamUrl = fileId ? `${import.meta.env.VITE_API_URL}/stream/${fileId}` : '';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0 bg-gradient-to-b from-background to-muted">
        <div className="relative w-full p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-foreground truncate pr-8">
              {title}
            </h3>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 h-8 w-8 rounded-full opacity-70 hover:opacity-100"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Album art placeholder */}
          <div className="w-24 h-24 mx-auto mb-6 rounded-lg bg-accent/20 flex items-center justify-center">
            <svg
              className="h-12 w-12 text-accent-foreground/50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
          </div>

          {/* Audio player */}
          <div className="relative rounded-lg overflow-hidden bg-card shadow-lg">
            {streamUrl && (
              <audio
                ref={audioRef}
                className="w-full"
                controls
              >
                <source src={streamUrl} type="audio/mpeg" />
                Your browser does not support the audio tag.
              </audio>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AudioPlayer; 