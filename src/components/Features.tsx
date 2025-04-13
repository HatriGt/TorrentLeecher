
import { Shield, CloudLightning, HardDrive, Zap, Smartphone, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const Features = () => {
  return (
    <section id="features" className="py-20 px-4 bg-gradient-to-b from-blue-50/50 to-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 mb-4 bg-primary/10 rounded-full">
            <span className="text-sm font-medium text-primary">Why Choose Us</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">Advanced Features</h2>
          <p className="text-foreground/80 max-w-xl mx-auto mb-8">
            Our platform offers unique advantages that make torrent downloading easier, faster, and more secure than traditional methods.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-8 card-gradient rounded-xl border border-border hover:shadow-lg transition-all duration-300">
              <div className="mb-6 w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <CloudLightning size={28} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Cloud-Based Downloads</h3>
              <p className="text-muted-foreground mb-4">Download torrents directly to Google Drive without using your computer's bandwidth or storage.</p>
            </div>
            
            <div className="p-8 card-gradient rounded-xl border border-border hover:shadow-lg transition-all duration-300">
              <div className="mb-6 w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center">
                <Shield size={28} className="text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Privacy Protection</h3>
              <p className="text-muted-foreground mb-4">Your real IP address is never exposed to the torrent network, keeping your identity secure.</p>
            </div>
            
            <div className="p-8 card-gradient rounded-xl border border-border hover:shadow-lg transition-all duration-300">
              <div className="mb-6 w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
                <Zap size={28} className="text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">High-Speed Downloads</h3>
              <p className="text-muted-foreground mb-4">Benefit from Google's high-speed servers for faster downloads than traditional methods.</p>
            </div>
            
            <div className="p-8 card-gradient rounded-xl border border-border hover:shadow-lg transition-all duration-300">
              <div className="mb-6 w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
                <Smartphone size={28} className="text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Access Anywhere</h3>
              <p className="text-muted-foreground mb-4">Download on any device and access your files from anywhere with an internet connection.</p>
            </div>
            
            <div className="p-8 card-gradient rounded-xl border border-border hover:shadow-lg transition-all duration-300">
              <div className="mb-6 w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <HardDrive size={28} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">No Local Storage Needed</h3>
              <p className="text-muted-foreground mb-4">Save space on your device by storing files directly in your Google Drive account.</p>
            </div>
            
            <div className="p-8 card-gradient rounded-xl border border-border hover:shadow-lg transition-all duration-300">
              <div className="mb-6 w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center">
                <Share2 size={28} className="text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Easy Sharing</h3>
              <p className="text-muted-foreground mb-4">Share downloaded files directly from Google Drive with anyone, anywhere.</p>
            </div>
          </div>
          
          <div className="mt-16">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white transition-all duration-200 shadow-lg"
            >
              Get Started Now
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
