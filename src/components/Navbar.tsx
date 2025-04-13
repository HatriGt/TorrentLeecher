
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Download, Menu, X, HardDrive } from "lucide-react";
import { cn } from "@/lib/utils";
import Logo from "@/components/Logo";
import StorageStatus from "@/components/StorageStatus";
import { getStorageInfo, StorageInfo } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStorageInfo = async () => {
      try {
        setLoading(true);
        const data = await getStorageInfo();
        setStorageInfo(data);
      } catch (error) {
        console.error("Failed to fetch storage info:", error);
        toast({
          title: "Error",
          description: "Failed to load storage information",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStorageInfo();
  }, [toast]);

  const scrollToDownloadSection = () => {
    const downloadSection = document.getElementById("download-section");
    if (downloadSection) {
      downloadSection.scrollIntoView({ behavior: "smooth" });
    }
    setIsMenuOpen(false);
  };

  const scrollToFilesSection = () => {
    const filesSection = document.getElementById("files-section");
    if (filesSection) {
      filesSection.scrollIntoView({ behavior: "smooth" });
    }
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center space-x-4">
          <Logo />
          <div className="hidden md:block ml-6">
            {loading ? (
              <div className="w-60 h-12 bg-muted animate-pulse rounded-md"></div>
            ) : storageInfo ? (
              <StorageStatus 
                used={storageInfo.used} 
                total={storageInfo.total} 
                isPremium={storageInfo.isPremium} 
              />
            ) : null}
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-foreground hover:text-primary hover:bg-muted"
            onClick={scrollToFilesSection}
          >
            <HardDrive size={18} className="mr-2" />
            <span>My Files</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-foreground hover:text-primary hover:bg-muted"
            onClick={scrollToDownloadSection}
          >
            <Download size={18} className="mr-2" />
            <span>Downloads</span>
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-9 w-9 border-primary/30 text-primary hover:text-primary hover:bg-muted"
            onClick={scrollToDownloadSection}
          >
            <Plus size={18} />
          </Button>
        </div>

        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden text-foreground"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      <div 
        className={cn(
          "md:hidden absolute w-full bg-card border-b border-border transition-all duration-300 ease-in-out overflow-hidden",
          isMenuOpen ? "max-h-screen" : "max-h-0"
        )}
      >
        <div className="container px-4 py-4 flex flex-col space-y-4">
          {!loading && storageInfo && (
            <div className="flex justify-center mb-2">
              <StorageStatus 
                used={storageInfo.used} 
                total={storageInfo.total} 
                isPremium={storageInfo.isPremium} 
              />
            </div>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center justify-start gap-2 text-foreground"
            onClick={scrollToFilesSection}
          >
            <HardDrive size={18} />
            <span>My Files</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center justify-start gap-2 text-foreground"
            onClick={scrollToDownloadSection}
          >
            <Download size={18} />
            <span>Downloads</span>
          </Button>
          <Button 
            variant="outline" 
            className="w-full border-primary/30 text-primary"
            onClick={scrollToDownloadSection}
          >
            <Plus size={18} className="mr-2" />
            <span>Add New Download</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
