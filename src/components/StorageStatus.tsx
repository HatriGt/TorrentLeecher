import { Progress } from "@/components/ui/progress";
import { ArrowRight } from "lucide-react";

interface StorageStatusProps {
  used: number;
  total: number;
  isPremium?: boolean;
}

const StorageStatus = ({ used = 0, total = 0, isPremium = false }: StorageStatusProps) => {
  const usedFormatted = (used || 0).toFixed(2);
  const totalFormatted = (total || 0).toFixed(2);
  const percentUsed = total > 0 ? (used / total) * 100 : 0;
  
  // Determine progress bar color based on usage percentage
  let progressColor = "bg-green-500";
  if (percentUsed > 70) progressColor = "bg-yellow-500";
  if (percentUsed > 90) progressColor = "bg-red-500";
  
  return (
    <div className="flex flex-col space-y-1 w-60">
      <div className="flex justify-between items-center text-sm">
        <span className="font-medium">
          {isPremium ? "PREMIUM" : "FREE STORAGE"}
        </span>
        {!isPremium && (
          <a 
            href="#pricing" 
            className="text-primary hover:text-primary/80 flex items-center text-xs transition-colors"
          >
            GET MORE
            <ArrowRight size={12} className="ml-1" />
          </a>
        )}
      </div>
      
      <Progress 
        value={percentUsed} 
        className="h-2 bg-muted"
        indicatorClassName={progressColor}
      />
      
      <div className="text-xs text-muted-foreground">
        {usedFormatted} GB / {totalFormatted} GB
      </div>
    </div>
  );
};

export default StorageStatus;
