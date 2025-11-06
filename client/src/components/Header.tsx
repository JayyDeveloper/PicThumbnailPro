import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
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
    <header className="bg-background/95 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/">
          <div className="flex items-center space-x-2 cursor-pointer group">
            <div className="gradient-primary p-2 rounded-modern shadow-soft group-hover:shadow-medium transition-all duration-300">
              <Film className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gradient">ThumbnailCraft</h1>
          </div>
        </Link>

        <div className="flex items-center space-x-3">
          <ThemeToggle />

          <Button
            size="sm"
            className="btn-gradient-primary hidden sm:inline-flex"
            asChild
          >
            <Link href="/ai-thumbnail">
              <Sparkles className="h-4 w-4 mr-1.5" />
              <span>AI Generator</span>
            </Link>
          </Button>

          {user ? (
            <>
              <Button
                size="sm"
                variant="outline"
                className="rounded-modern hover-lift hidden md:inline-flex"
                asChild
              >
                <Link href="/pricing">
                  <Crown className="h-4 w-4 mr-1.5" />
                  <span>Upgrade</span>
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-modern hover-lift">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="gradient-primary text-white text-xs font-semibold">
                          {user.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {user.points !== undefined && (
                        <div className="flex items-center gap-1 badge-gradient-accent">
                          <Sparkles className="h-3 w-3" />
                          <span className="font-semibold">{user.points}</span>
                        </div>
                      )}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-modern">
                  <DropdownMenuItem asChild>
                    <Link href="/account" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>My Account</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                    <LogIn className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button
              size="sm"
              className="btn-gradient-primary"
              asChild
            >
              <Link href="/auth">
                <LogIn className="h-4 w-4 mr-1.5" />
                <span>Sign In</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
