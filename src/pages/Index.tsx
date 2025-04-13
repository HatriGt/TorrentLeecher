
import Navbar from "@/components/Navbar";
import MagnetInput from "@/components/MagnetInput";
import DownloadsList from "@/components/DownloadsList";
import FilesList from "@/components/FilesList";
import Features from "@/components/Features";
import Footer from "@/components/Footer";
import AnimatedBackground from "@/components/AnimatedBackground";
import HeroIllustration from "@/components/HeroIllustration";
import { Button } from "@/components/ui/button";
import { ArrowRight, Database, Shield, CloudDownload, Zap, CheckCircle } from "lucide-react";

const Index = () => {
  const scrollToDownload = () => {
    const downloadSection = document.getElementById("download-section");
    if (downloadSection) {
      downloadSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById("features-section");
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-gradient-to-b from-blue-50/80 via-indigo-50/50 to-white">
      <AnimatedBackground />
      <Navbar />

      {/* Hero Section */}
      <section className="pt-28 pb-16 px-4 relative">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="text-left animate-slide-up">
              <div className="inline-block px-4 py-2 mb-4 bg-primary/10 rounded-full">
                <span className="text-sm font-medium text-primary">Fast, Secure & Private</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight gradient-text">
                Download Torrents Directly to Google Drive
              </h1>
              <p className="text-lg text-foreground/80 mb-8 max-w-lg">
                TorrentLeecher lets you download torrents quickly and securely without exposing your IP address or installing any software.
              </p>
              <div className="flex flex-wrap items-center gap-4 mb-8">
                <Button 
                  onClick={scrollToDownload}
                  size="lg" 
                  className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white transition-all duration-200 shadow-lg"
                >
                  Start Downloading
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-primary/30 text-foreground hover:text-primary hover:bg-primary/5"
                  onClick={scrollToFeatures}
                >
                  Learn More
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                <div className="flex items-center">
                  <CheckCircle size={16} className="mr-2 text-secondary" />
                  <span className="text-sm">No registration</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle size={16} className="mr-2 text-secondary" />
                  <span className="text-sm">Unlimited downloads</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle size={16} className="mr-2 text-secondary" />
                  <span className="text-sm">100% secure</span>
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <HeroIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* Features Cards */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="p-8 card-gradient rounded-xl border border-border hover:shadow-lg transition-all duration-300 animate-slide-up delay-1">
              <div className="mb-6 w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Database size={28} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Cloud Storage</h3>
              <p className="text-muted-foreground">Download directly to Google Drive without using your local storage space</p>
            </div>
            
            <div className="p-8 card-gradient rounded-xl border border-border hover:shadow-lg transition-all duration-300 animate-slide-up delay-2">
              <div className="mb-6 w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center">
                <Shield size={28} className="text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Secure & Private</h3>
              <p className="text-muted-foreground">Your IP address remains hidden, keeping your downloads private and secure</p>
            </div>
            
            <div className="p-8 card-gradient rounded-xl border border-border hover:shadow-lg transition-all duration-300 animate-slide-up delay-3">
              <div className="mb-6 w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
                <Zap size={28} className="text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Fast Transfers</h3>
              <p className="text-muted-foreground">Leverages Google's high-speed infrastructure for quick, reliable downloads</p>
            </div>
          </div>
          
          <div className="relative w-full max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-xl animate-slide-up delay-4">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 backdrop-blur-sm"></div>
            <div className="relative glass-effect rounded-2xl overflow-hidden border border-white/20 p-8">
              <div className="w-full h-8 flex items-center mb-6">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
              </div>
              <div className="flex items-center space-x-4 bg-muted/50 rounded-lg p-4 mb-6">
                <CloudDownload size={20} className="text-primary" />
                <div className="text-left text-sm font-mono text-muted-foreground overflow-hidden overflow-ellipsis">
                  magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel
                </div>
              </div>
              <div className="relative mt-6">
                <div className="h-3 w-full bg-muted/50 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full animate-pulse" style={{ width: "45%" }}></div>
                </div>
                <div className="mt-3 flex justify-between text-sm">
                  <span className="text-muted-foreground">Downloading... 45%</span>
                  <span className="text-muted-foreground font-medium">21 MB/s</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section id="download-section" className="py-20 px-4 bg-gradient-to-b from-white to-blue-50/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-2 mb-4 bg-secondary/10 rounded-full">
              <span className="text-sm font-medium text-secondary">Start Now</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">Paste Your Magnet Link</h2>
            <p className="text-foreground/80 max-w-xl mx-auto">
              Just paste your magnet link below, and we'll handle the rest. Your files will be ready to download in minutes.
            </p>
          </div>
          
          <MagnetInput />
          
          <div className="mt-16 pt-10 border-t border-border/50">
            <DownloadsList />
          </div>
        </div>
      </section>

      {/* Files Section */}
      <section id="files-section" className="py-20 px-4 bg-muted/10">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-2 mb-4 bg-accent/10 rounded-full">
              <span className="text-sm font-medium text-accent">Your Library</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">Your Files</h2>
            <p className="text-foreground/80 max-w-xl mx-auto">
              All your downloaded files are securely stored and ready for access whenever you need them.
            </p>
          </div>
          
          <FilesList />
        </div>
      </section>

      {/* Features Section */}
      <section id="features-section">
        <Features />
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
