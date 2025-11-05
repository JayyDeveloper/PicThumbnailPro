import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  HelpCircle, 
  Crown, 
  Film, 
  User, 
  LogIn,
  Sparkles
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Header() {
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="bg-background border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/">
          <div className="flex items-center space-x-2 cursor-pointer">
            <Film className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold text-foreground">ThumbnailCraft</h1>
          </div>
        </Link>
        <div className="flex space-x-3">
          <ThemeToggle />
          
          <Button
            size="sm"
            className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white font-bold hover:opacity-90 transition-opacity"
            asChild
          >
            <Link href="/ai-thumbnail">
              <Sparkles className="h-5 w-5 mr-1" />
              <span>AI Thumbnail</span>
            </Link>
          </Button>
          
          {user ? (
            <>
              <Button size="sm" className="bg-primary hover:bg-blue-600 text-white" asChild>
                <Link href="/pricing">
                  <Crown className="h-5 w-5 mr-1" />
                  <span>Upgrade</span>
                </Link>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="ml-2">
                    <div className="flex items-center">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {user.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {user.points > 0 && (
                        <span className="text-sm font-medium flex items-center mr-1">
                          <Sparkles className="h-4 w-4 text-yellow-500 mr-1" />
                          {user.points}
                        </span>
                      )}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/account">
                      <User className="mr-2 h-4 w-4" />
                      <span>My Account</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogIn className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button size="sm" className="bg-primary hover:bg-blue-600 text-white" asChild>
              <Link href="/auth">
                <LogIn className="h-5 w-5 mr-1" />
                <span>Sign In</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
