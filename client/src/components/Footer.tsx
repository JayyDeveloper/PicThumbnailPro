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
    <footer className="relative bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-950 dark:via-blue-950/20 dark:to-purple-950/20 border-t border-border/50 mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:justify-between">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center space-x-2 group">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl shadow-md">
                <Film className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">ThumbnailCraft</h1>
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
        <hr className="my-6 border-border/50" />
        <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} ThumbnailCraft. All rights reserved.</p>
          <div className="flex space-x-3 mt-3 sm:mt-0">
            <a href="#" className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 transition-colors" aria-label="Facebook">
              <FaFacebook className="h-4 w-4" />
            </a>
            <a href="#" className="p-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 transition-colors" aria-label="Twitter">
              <FaTwitter className="h-4 w-4" />
            </a>
            <a href="#" className="p-2 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 text-pink-600 dark:text-pink-400 transition-colors" aria-label="Instagram">
              <FaInstagram className="h-4 w-4" />
            </a>
            <a href="#" className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-colors" aria-label="YouTube">
              <FaYoutube className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
