import { Link } from "wouter";
import { Film } from "lucide-react";
import { 
  FaFacebook, 
  FaTwitter, 
  FaInstagram, 
  FaYoutube 
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-muted border-t mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="md:flex md:justify-between">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center space-x-2">
              <Film className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold text-foreground">ThumbnailCraft</h1>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Create professional YouTube thumbnails in minutes</p>
          </div>
          
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <h2 className="mb-4 text-sm font-semibold text-foreground">Resources</h2>
              <ul className="text-muted-foreground text-sm space-y-2">
                <li><Link href="#" className="hover:text-primary">Tutorials</Link></li>
                <li><Link href="#" className="hover:text-primary">Blog</Link></li>
                <li><Link href="#" className="hover:text-primary">Support</Link></li>
              </ul>
            </div>
            <div>
              <h2 className="mb-4 text-sm font-semibold text-foreground">Company</h2>
              <ul className="text-muted-foreground text-sm space-y-2">
                <li><Link href="#" className="hover:text-primary">About</Link></li>
                <li><Link href="/pricing" className="hover:text-primary">Pricing</Link></li>
                <li><Link href="#" className="hover:text-primary">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h2 className="mb-4 text-sm font-semibold text-foreground">Legal</h2>
              <ul className="text-muted-foreground text-sm space-y-2">
                <li><Link href="#" className="hover:text-primary">Privacy</Link></li>
                <li><Link href="#" className="hover:text-primary">Terms</Link></li>
                <li><Link href="#" className="hover:text-primary">Cookies</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <hr className="my-6 border-border" />
        <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} ThumbnailCraft. All rights reserved.</p>
          <div className="flex space-x-4 mt-3 sm:mt-0">
            <a href="#" className="hover:text-primary" aria-label="Facebook">
              <FaFacebook />
            </a>
            <a href="#" className="hover:text-primary" aria-label="Twitter">
              <FaTwitter />
            </a>
            <a href="#" className="hover:text-primary" aria-label="Instagram">
              <FaInstagram />
            </a>
            <a href="#" className="hover:text-primary" aria-label="YouTube">
              <FaYoutube />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
