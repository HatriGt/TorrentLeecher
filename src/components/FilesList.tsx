import { useState, useEffect, useCallback } from "react";
import { Search, ChevronUp, Grid, List as ListIcon, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import FileItem from "./FileItem";
import { useToast } from "@/hooks/use-toast";
import { DriveItem } from "@/types/torrent";
import { getDriveFiles, organizeFilesIntoTree } from "@/services/driveService";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type SortField = "name" | "size" | "modifiedTime";
type SortDirection = "asc" | "desc";
type ViewMode = "grid" | "list";

interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

const FilesList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [files, setFiles] = useState<DriveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState<DriveItem[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: "name", direction: "asc" });
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
      setSelectedFiles(new Set());
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

  const handleFileSelect = (fileId: string, multiSelect: boolean) => {
    setSelectedFiles(prev => {
      const newSelection = new Set(prev);
      if (multiSelect) {
        if (newSelection.has(fileId)) {
          newSelection.delete(fileId);
        } else {
          newSelection.add(fileId);
        }
      } else {
        newSelection.clear();
        newSelection.add(fileId);
      }
      return newSelection;
    });
  };

  const handleSort = (field: SortField) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc"
    }));
  };

  const sortFiles = useCallback((files: DriveItem[]) => {
    return [...files].sort((a, b) => {
      const direction = sortConfig.direction === "asc" ? 1 : -1;
      
      switch (sortConfig.field) {
        case "name":
          return direction * a.name.localeCompare(b.name);
        case "size":
          return direction * (parseInt(a.size || "0") - parseInt(b.size || "0"));
        case "modifiedTime":
          return direction * (new Date(a.modifiedTime || 0).getTime() - new Date(b.modifiedTime || 0).getTime());
        default:
          return 0;
      }
    });
  }, [sortConfig]);

  const filteredAndSortedFiles = sortFiles(
    files.filter(file => file.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="w-full h-full flex flex-col bg-background">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-card">
        <div className="flex items-center space-x-2">
          {currentPath.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFolderUp}
              className="h-8 w-8"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
          )}
          <div className="flex items-center space-x-1 text-sm">
            <span className="font-medium">My Drive</span>
            {currentPath.map((folder, index) => (
              <div key={folder.id} className="flex items-center space-x-1">
                <span className="text-muted-foreground">/</span>
                <button 
                  onClick={() => setCurrentPath(prev => prev.slice(0, index + 1))}
                  className="hover:text-primary transition-colors"
                >
                  {folder.name}
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="search"
              placeholder="Search files"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-8"
            />
          </div>
          <Separator orientation="vertical" className="h-8" />
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
          >
            {viewMode === "grid" ? <ListIcon className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        {viewMode === "list" && (
          <div className="sticky top-0 z-10 grid grid-cols-12 gap-4 px-6 py-2 bg-muted/50 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b text-sm font-medium text-muted-foreground">
            <div 
              className="col-span-6 flex items-center space-x-2 cursor-pointer hover:text-foreground"
              onClick={() => handleSort("name")}
            >
              <span>Name</span>
              {sortConfig.field === "name" && (
                <ArrowUpDown className="h-3.5 w-3.5" />
              )}
            </div>
            <div 
              className="col-span-2 text-right cursor-pointer hover:text-foreground"
              onClick={() => handleSort("size")}
            >
              <span>Size</span>
              {sortConfig.field === "size" && (
                <ArrowUpDown className="h-3.5 w-3.5 ml-1 inline-block" />
              )}
            </div>
            <div 
              className="col-span-3 text-right cursor-pointer hover:text-foreground"
              onClick={() => handleSort("modifiedTime")}
            >
              <span>Last Modified</span>
              {sortConfig.field === "modifiedTime" && (
                <ArrowUpDown className="h-3.5 w-3.5 ml-1 inline-block" />
              )}
            </div>
            <div className="col-span-1"></div>
          </div>
        )}

        <div className={cn(
          "min-h-[200px]",
          viewMode === "grid" 
            ? "p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4" 
            : "divide-y divide-border"
        )}>
          {loading ? (
            <div className={viewMode === "grid" ? "col-span-full space-y-4" : "space-y-2 p-4"}>
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded-md" />
              ))}
            </div>
          ) : filteredAndSortedFiles.length === 0 ? (
            <div className={cn(
              "flex flex-col items-center justify-center text-center py-12 text-muted-foreground",
              viewMode === "grid" ? "col-span-full" : ""
            )}>
              <div className="rounded-full bg-muted p-3 mb-4">
                <Search className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium">No files found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchTerm ? "Try a different search term" : "This folder is empty"}
              </p>
            </div>
          ) : (
            <>
              {filteredAndSortedFiles.map((file) => (
                <FileItem
                  key={file.id}
                  file={file}
                  viewMode={viewMode}
                  onFolderClick={handleFolderClick}
                  isSelected={selectedFiles.has(file.id)}
                  onSelect={(multiSelect) => handleFileSelect(file.id, multiSelect)}
                />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilesList;
