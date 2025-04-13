
import { useState } from "react";
import { Magnet, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { startDownload, simulateDownloadProgress } from "@/services/downloadService";
import { useToast } from "@/hooks/use-toast";

const MagnetInput = () => {
  const [magnetLink, setMagnetLink] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
        setMagnetLink("");
        
        // Simulate download progress for demo purposes
        // In a real app, this would be handled by WebSockets
        simulateDownloadProgress(result.id);
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
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
      <div className="relative p-1 bg-gradient-to-r from-primary to-secondary rounded-xl">
        <div className="relative bg-white dark:bg-gray-950 rounded-lg">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Magnet className="h-5 w-5 text-primary" />
          </div>
          <Input
            type="text"
            value={magnetLink}
            onChange={(e) => setMagnetLink(e.target.value)}
            placeholder="Paste magnet link here..."
            className="pl-12 pr-32 py-6 text-foreground bg-white border-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/50 rounded-lg"
          />
          <div className="absolute inset-y-0 right-2 flex items-center">
            <Button 
              type="submit" 
              disabled={isLoading || !magnetLink.trim()} 
              className="mr-1 h-[85%] bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-medium"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Starting...
                </>
              ) : (
                "Start Download"
              )}
            </Button>
          </div>
        </div>
      </div>
      <div className="text-center mt-4 text-sm text-muted-foreground">
        By using our service, you agree to our <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>
      </div>
    </form>
  );
};

export default MagnetInput;
