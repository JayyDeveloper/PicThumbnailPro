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
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/">
          <div className="flex items-center space-x-2 cursor-pointer group">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl shadow-md group-hover:shadow-lg transition-all">
              <Film className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">ThumbnailCraft</h1>
          </div>
        </Link>
        <div className="flex space-x-3">
          <ThemeToggle />

          <Button
            size="sm"
            className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white font-bold hover:opacity-90 transition-opacity rounded-xl shadow-md hover:shadow-lg"
            asChild
          >
            <Link href="/ai">
              <Sparkles className="h-5 w-5 mr-1" />
              <span>Try AI</span>
            </Link>
          </Button>
          
          {user ? (
            <>
              <Button size="sm" className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white rounded-xl shadow-md hover:shadow-lg font-semibold" asChild>
                <Link href="/pricing">
                  <Crown className="h-5 w-5 mr-1" />
                  <span>Upgrade</span>
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="ml-2 rounded-xl border-2">
                    <div className="flex items-center">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs font-semibold">
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
                <DropdownMenuContent align="end" className="rounded-xl">
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
            <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-md hover:shadow-lg font-semibold" asChild>
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
