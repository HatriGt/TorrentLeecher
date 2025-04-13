
import { Github, Twitter, Mail, Heart } from "lucide-react";
import Logo from "./Logo";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-muted/50 border-t border-border pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-8">
          <div>
            <Logo className="mb-4" />
            <p className="text-muted-foreground text-sm mb-4">
              An open-source tool to download torrents directly to your Google Drive without exposing your IP address.
            </p>
            <div className="flex space-x-4">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 transition-colors">
                <Github size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="mailto:info@example.com" className="text-primary hover:text-primary/80 transition-colors">
                <Mail size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-primary mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Documentation</a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">API Reference</a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">GitHub Repository</a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Deployment Guide</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-primary mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Acceptable Use Policy</a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">DMCA Policy</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border pt-6 mt-6 text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center">
            Made with <Heart size={14} className="mx-1 text-primary" /> by TorrentLeecher Team
          </p>
          <p className="mt-2">
            &copy; {currentYear} TorrentLeecher. Open source under MIT License.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
