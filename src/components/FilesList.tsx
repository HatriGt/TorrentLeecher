import { useState, useEffect } from "react";
import { Search, ChevronUp, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import FileItem from "./FileItem";
import NewFolderDialog from "./NewFolderDialog";
import { useToast } from "@/hooks/use-toast";
import { DriveItem } from "@/types/torrent";
import { getDriveFiles, organizeFilesIntoTree } from "@/services/driveService";
import { Button } from "@/components/ui/button";

const FilesList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [files, setFiles] = useState<DriveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState<DriveItem[]>([]);
  const { toast } = useToast();
  
  const fetchFiles = async () => {
    try {
      setLoading(true);
      const data = await getDriveFiles(
        currentPath.length > 0 ? currentPath[currentPath.length - 1].id : undefined,
        false
      );
      const organizedFiles = organizeFilesIntoTree(data);
      setFiles(organizedFiles);
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
  }, [currentPath]);

  const handleFolderClick = (folder: DriveItem) => {
    setCurrentPath(prev => [...prev, folder]);
  };

  const handleFolderUp = () => {
    setCurrentPath(prev => prev.slice(0, -1));
  };

  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full max-w-6xl mx-auto animate-fade-in">
      <div className="bg-white rounded-lg border shadow-sm">
        {/* Header with breadcrumb and actions */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            {currentPath.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFolderUp}
                className="mr-2"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
            )}
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">My Drive</span>
              {currentPath.map((folder, index) => (
                <div key={folder.id} className="flex items-center space-x-2">
                  <span>/</span>
                  <span className="text-foreground">{folder.name}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search files"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-white"
              />
            </div>
            <NewFolderDialog onFolderCreated={fetchFiles}>
              <Button variant="outline" size="sm" className="flex items-center space-x-1">
                <Plus className="h-4 w-4" />
                <span>Create Folder</span>
              </Button>
            </NewFolderDialog>
          </div>
        </div>

        {/* File list header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-2 border-b text-sm font-medium text-muted-foreground">
          <div className="col-span-6">Name</div>
          <div className="col-span-2 text-right">Size</div>
          <div className="col-span-3 text-right">Last Changed</div>
          <div className="col-span-1"></div>
        </div>

        {/* File list content */}
        <div className="divide-y divide-border">
          {loading ? (
            <div className="space-y-2 p-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-muted/50 animate-pulse rounded-md" />
              ))}
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No files found</p>
            </div>
          ) : (
            <div>
              {filteredFiles.map((file) => (
                <FileItem
                  key={file.id}
                  file={file}
                  onFolderClick={handleFolderClick}
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
