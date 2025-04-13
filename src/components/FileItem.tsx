
import { useState } from "react";
import { File, Folder, ExternalLink, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatFileSize, formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface FileItemProps {
  id: string;
  name: string;
  size: string | number;
  isFolder?: boolean;
  date?: string;
  driveLink?: string;
  onDelete?: (id: string) => void;
}

const FileItem = ({
  id,
  name,
  size,
  isFolder = false,
  date,
  driveLink,
  onDelete,
}: FileItemProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  // Format file size if it's a number
  const formattedSize = typeof size === "number" ? formatFileSize(size) : size;
  const formattedDate = date ? formatDate(date) : "Today";

  const handleOpenLink = () => {
    if (driveLink) {
      window.open(driveLink, "_blank", "noopener,noreferrer");
    } else {
      toast({
        title: "Error",
        description: "Drive link not available for this file",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    if (driveLink) {
      const link = document.createElement('a');
      link.href = driveLink;
      link.setAttribute('download', name);
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      toast({
        title: "Error",
        description: "Download link not available",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (onDelete) {
      try {
        setIsDeleting(true);
        await onDelete(id);
      } catch (error) {
        console.error("Error during delete:", error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div
      className={`flex items-center p-3 ${
        isHovered ? "bg-muted/50" : ""
      } rounded-lg transition-colors duration-200 group animate-fade-in`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex-shrink-0 mr-4 w-6">
        <input type="checkbox" className="rounded border-input" />
      </div>
      <div className="flex-shrink-0 mr-4">
        {isFolder ? (
          <Folder
            size={20}
            className="text-amber-500"
            fill="rgba(245, 158, 11, 0.2)"
          />
        ) : (
          <File
            size={20}
            className="text-primary"
            stroke="rgba(31, 139, 255, 0.8)"
          />
        )}
      </div>
      <div className="flex-grow truncate">
        <p className="text-foreground truncate" title={name}>
          {name}
        </p>
      </div>
      <div className="flex-shrink-0 w-24 text-right mr-4 text-sm text-muted-foreground">
        {formattedSize}
      </div>
      <div className="flex-shrink-0 w-32 text-right mr-4 text-sm text-muted-foreground">
        {formattedDate}
      </div>
      <div className="flex-shrink-0 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {driveLink && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-primary hover:text-primary hover:bg-primary/10"
            onClick={handleOpenLink}
            title="Open in Google Drive"
          >
            <ExternalLink size={16} />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-primary hover:text-primary hover:bg-primary/10"
          onClick={handleDownload}
          title="Download file"
        >
          <Download size={16} />
        </Button>
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-red-500 hover:text-red-400 hover:bg-red-500/10"
            onClick={handleDelete}
            disabled={isDeleting}
            title="Delete file"
          >
            <Trash2 size={16} />
          </Button>
        )}
      </div>
    </div>
  );
};

export default FileItem;
