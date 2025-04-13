import { useState } from "react";
import { Magnet, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { startDownload } from "@/services/downloadService";
import { useToast } from "@/hooks/use-toast";
import DownloadProgress from "@/components/DownloadProgress";

interface ActiveDownload {
  id: string;
  fileName: string;
}

const MagnetInput = () => {
  const [magnetLink, setMagnetLink] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeDownload, setActiveDownload] = useState<ActiveDownload | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!magnetLink.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid magnet link",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const result = await startDownload(magnetLink);
      
      if (result.success && result.id) {
        toast({
          title: "Success",
          description: result.message || "Download started successfully",
        });

        // Extract file name from magnet link
        const nameMatch = magnetLink.match(/dn=([^&]+)/);
        const fileName = nameMatch ? decodeURIComponent(nameMatch[1]) : "Unknown";

        setActiveDownload({
          id: result.id,
          fileName
        });
        setMagnetLink("");
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to start download",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Error",
        description: "Failed to start download. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-2xl">
        <Input
          type="text"
          placeholder="Enter magnet link..."
          value={magnetLink}
          onChange={(e) => setMagnetLink(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Magnet className="h-4 w-4" />
          )}
        </Button>
      </form>

      {activeDownload && (
        <DownloadProgress
          downloadId={activeDownload.id}
          fileName={activeDownload.fileName}
        />
      )}
    </div>
  );
};

export default MagnetInput;
