
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import FileItem from "./FileItem";
import NewFolderDialog from "./NewFolderDialog";
import { getCompletedFiles, deleteFile } from "@/services/downloadService";
import { useToast } from "@/hooks/use-toast";
import { FileItem as FileItemType } from "@/types/torrent";
import { supabase } from "@/integrations/supabase/client";

const FilesList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [files, setFiles] = useState<FileItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  const fetchFiles = async () => {
    try {
      setLoading(true);
      const data = await getCompletedFiles();
      setFiles(data);
    } catch (error) {
      console.error("Failed to fetch files:", error);
      toast({
        title: "Error",
        description: "Failed to load files",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();

    // Subscribe to changes on the files table
    const channel = supabase
      .channel('files-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'files'
        }, 
        async () => {
          // Refetch files when changes occur
          await fetchFiles();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const handleDeleteFile = async (id: string) => {
    try {
      await deleteFile(id);
      setFiles(prevFiles => prevFiles.filter(file => file.id !== id));
      toast({
        title: "Success",
        description: "File deleted successfully",
      });
    } catch (error) {
      console.error("Failed to delete file:", error);
      toast({
        title: "Error",
        description: "Failed to delete file",
        variant: "destructive",
      });
    }
  };

  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full max-w-5xl mx-auto animate-slide-up">
      <div className="bg-card rounded-lg border border-border overflow-hidden shadow-sm">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center w-1/2">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search Your Files"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-white border-input input-highlight"
              />
            </div>
          </div>
          <NewFolderDialog onFolderCreated={fetchFiles} />
        </div>
        
        <div className="p-2">
          <div className="flex items-center p-3 text-sm text-muted-foreground font-medium">
            <div className="flex-shrink-0 mr-4 w-6">
              <input type="checkbox" className="rounded border-input" />
            </div>
            <div className="flex-grow">NAME</div>
            <div className="flex-shrink-0 w-24 text-right mr-4">SIZE</div>
            <div className="flex-shrink-0 w-32 text-right mr-4">LAST CHANGED</div>
            <div className="flex-shrink-0 w-20"></div>
          </div>
          
          {loading ? (
            <div className="space-y-2 p-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded-md"></div>
              ))}
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <p>No files found</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredFiles.map((file) => (
                <FileItem
                  key={file.id}
                  id={file.id}
                  name={file.name}
                  size={file.size}
                  date={file.date}
                  isFolder={file.isFolder}
                  driveLink={file.driveLink}
                  onDelete={handleDeleteFile}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilesList;
