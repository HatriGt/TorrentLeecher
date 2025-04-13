
import { Download } from "lucide-react";

const Logo = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center shadow-glow">
        <Download size={22} className="text-white" />
      </div>
      <div className="flex flex-col">
        <span className="text-xl font-display font-semibold text-foreground">TorrentLeecher</span>
        <span className="text-xs text-muted-foreground">Cloud Downloads</span>
      </div>
    </div>
  );
};

export default Logo;
