
import { CloudDownload, Check, FileType2, Shield, Download } from "lucide-react";

const HeroIllustration = () => {
  return (
    <div className="relative w-full h-[400px] flex items-center justify-center">
      {/* Main circle */}
      <div className="absolute w-64 h-64 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 animate-pulse-slow"></div>
      
      {/* Outer orbit */}
      <div className="absolute w-80 h-80 rounded-full border border-dashed border-primary/20 animate-spin-slow"></div>
      
      {/* Inner orbit */}
      <div className="absolute w-48 h-48 rounded-full border border-dashed border-secondary/20 animate-spin-slow" style={{ animationDirection: 'reverse' }}></div>
      
      {/* Center icon */}
      <div className="relative z-10 w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
        <CloudDownload size={40} className="text-white" />
      </div>
      
      {/* Floating elements */}
      <div className="absolute top-16 left-10 w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center animate-float" style={{ animationDelay: '0.5s' }}>
        <Shield size={28} className="text-primary" />
      </div>
      
      <div className="absolute bottom-24 right-12 w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center animate-float" style={{ animationDelay: '1s' }}>
        <FileType2 size={28} className="text-secondary" />
      </div>
      
      <div className="absolute bottom-16 left-24 w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center animate-float" style={{ animationDelay: '1.5s' }}>
        <Download size={28} className="text-accent" />
      </div>
      
      <div className="absolute top-32 right-8 w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center animate-float" style={{ animationDelay: '2s' }}>
        <Check size={28} className="text-green-500" />
      </div>
      
      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
        <path d="M160,200 L220,120" stroke="url(#gradient1)" strokeWidth="1" fill="none" />
        <path d="M160,200 L100,80" stroke="url(#gradient2)" strokeWidth="1" fill="none" />
        <path d="M160,200 L240,280" stroke="url(#gradient3)" strokeWidth="1" fill="none" />
        <path d="M160,200 L80,280" stroke="url(#gradient4)" strokeWidth="1" fill="none" />
        
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(31, 139, 255, 0.2)" />
            <stop offset="100%" stopColor="rgba(31, 139, 255, 0.8)" />
          </linearGradient>
          <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(194, 120, 235, 0.2)" />
            <stop offset="100%" stopColor="rgba(194, 120, 235, 0.8)" />
          </linearGradient>
          <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(241, 108, 150, 0.2)" />
            <stop offset="100%" stopColor="rgba(241, 108, 150, 0.8)" />
          </linearGradient>
          <linearGradient id="gradient4" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(80, 250, 123, 0.2)" />
            <stop offset="100%" stopColor="rgba(80, 250, 123, 0.8)" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default HeroIllustration;
