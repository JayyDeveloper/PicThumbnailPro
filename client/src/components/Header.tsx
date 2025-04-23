import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { HelpCircle, Crown, Film } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/">
          <div className="flex items-center space-x-2 cursor-pointer">
            <Film className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold text-gray-900">ThumbnailCraft</h1>
          </div>
        </Link>
        <div className="flex space-x-4">
          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
            <HelpCircle className="h-5 w-5 mr-1" />
            <span className="ml-1 hidden sm:inline">Help</span>
          </Button>
          <Button size="sm" className="bg-primary hover:bg-blue-600 text-white" asChild>
            <Link href="/pricing">
              <Crown className="h-5 w-5 mr-1" />
              <span>Upgrade</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
