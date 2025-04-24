import { Link } from "wouter";
import { Sparkles, ShoppingBag } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface InsufficientPointsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InsufficientPointsDialog({
  open,
  onOpenChange,
}: InsufficientPointsDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" /> 
            Out of Points
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base text-muted-foreground">
            <p>You need 1 point to download or save a thumbnail.</p>
            <p className="mt-1">Each new user gets 1 free trial point. Additional points can be purchased in the packages below.</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="mt-4 p-4 rounded-md bg-secondary/50 border border-border">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-semibold">Starter</h3>
              <p className="text-sm text-muted-foreground">5 points</p>
            </div>
            <div className="text-lg font-bold">$4.99</div>
          </div>
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-semibold">Gold</h3>
              <p className="text-sm text-muted-foreground">15 points</p>
            </div>
            <div className="text-lg font-bold">$9.99</div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Platinum</h3>
              <p className="text-sm text-muted-foreground">50 points</p>
            </div>
            <div className="text-lg font-bold">$19.99</div>
          </div>
        </div>
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Link 
              href="/pricing" 
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md flex items-center"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Get More Points
            </Link>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}