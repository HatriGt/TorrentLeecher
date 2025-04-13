
import { useState, useEffect } from "react";
import DownloadProgress from "./DownloadProgress";
import { getActiveDownloads } from "@/services/downloadService";
import { useToast } from "@/hooks/use-toast";
import { DownloadItem } from "@/types/torrent";
import { supabase } from "@/integrations/supabase/client";

const DownloadsList = () => {
  const [activeDownloads, setActiveDownloads] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDownloads = async () => {
      try {
        setLoading(true);
        const data = await getActiveDownloads();
        setActiveDownloads(data);
      } catch (error) {
        console.error("Failed to fetch downloads:", error);
        toast({
          title: "Error",
          description: "Failed to load downloads",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDownloads();

    // Set up a real-time subscription to the downloads table
    const channel = supabase
      .channel('downloads-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'downloads',
          filter: 'status=in.(queued,downloading,processing)'
        }, 
        async () => {
          // Refetch downloads when changes occur
          await fetchDownloads();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      <h2 className="text-xl font-display font-semibold mb-4 text-foreground">Your Downloads</h2>
      
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-lg"></div>
          ))}
        </div>
      ) : activeDownloads.length === 0 ? (
        <div className="text-center text-muted-foreground py-10 bg-muted/50 rounded-lg border border-border">
          <p>No downloads in progress</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeDownloads.map((download, index) => (
            <div key={download.id} className={`delay-${index + 1}`}>
              <DownloadProgress
                downloadId={download.id}
                fileName={download.fileName}
                fileSize={download.fileSize}
                initialProgress={download.progress}
                status={download.status}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DownloadsList;
