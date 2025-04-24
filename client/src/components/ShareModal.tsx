import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  Facebook, 
  Twitter, 
  Linkedin, 
  Mail, 
  Copy, 
  Check, 
  Share2, 
  Share,
  Instagram,
  Download
} from "lucide-react";

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  thumbnailName: string;
}

export function ShareModal({ open, onOpenChange, imageUrl, thumbnailName }: ShareModalProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  // Construct sharing URLs
  const shareUrl = window.location.origin + imageUrl;
  const shareTitle = `Check out my thumbnail: ${thumbnailName}`;
  const shareText = `I created this awesome YouTube thumbnail with ThumbnailCraft: ${thumbnailName}`;
  
  // Encoded values for sharing
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(shareTitle);
  const encodedText = encodeURIComponent(shareText);
  
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
  const emailShareUrl = `mailto:?subject=${encodedTitle}&body=${encodedText}%0A%0A${encodedUrl}`;
  
  // Copy link to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      
      toast({
        title: "Link copied!",
        description: "The link has been copied to your clipboard.",
      });
      
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  // Share to social media
  const shareToSocial = (platform: string) => {
    let shareLink = "";
    
    switch (platform) {
      case "facebook":
        shareLink = facebookShareUrl;
        break;
      case "twitter":
        shareLink = twitterShareUrl;
        break;
      case "linkedin":
        shareLink = linkedinShareUrl;
        break;
      case "email":
        shareLink = emailShareUrl;
        break;
      default:
        return;
    }
    
    window.open(shareLink, "_blank", "width=600,height=400");
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Share2 className="mr-2 h-5 w-5 text-primary" />
            Share Your Thumbnail
          </DialogTitle>
          <DialogDescription>
            Share your creation with friends, colleagues, or on social media.
          </DialogDescription>
        </DialogHeader>
        
        {/* Thumbnail Preview */}
        <div className="flex justify-center p-2 border rounded-md bg-muted">
          <img 
            src={imageUrl} 
            alt={thumbnailName} 
            className="max-h-40 rounded-md shadow-sm" 
          />
        </div>
        
        {/* Share URL input */}
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Input
              value={shareUrl}
              readOnly
              className="w-full"
            />
          </div>
          <Button
            type="button"
            size="sm"
            className="px-3"
            onClick={copyToClipboard}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span className="sr-only">Copy</span>
          </Button>
        </div>
        
        {/* Social Media Sharing Buttons */}
        <div className="flex justify-center space-x-4">
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full w-10 h-10 bg-blue-100 hover:bg-blue-200 text-blue-600" 
            onClick={() => shareToSocial("facebook")}
          >
            <Facebook className="h-5 w-5" />
            <span className="sr-only">Share on Facebook</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full w-10 h-10 bg-sky-100 hover:bg-sky-200 text-sky-500" 
            onClick={() => shareToSocial("twitter")}
          >
            <Twitter className="h-5 w-5" />
            <span className="sr-only">Share on Twitter</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full w-10 h-10 bg-blue-100 hover:bg-blue-200 text-blue-800" 
            onClick={() => shareToSocial("linkedin")}
          >
            <Linkedin className="h-5 w-5" />
            <span className="sr-only">Share on LinkedIn</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full w-10 h-10 bg-pink-100 hover:bg-pink-200 text-pink-600" 
          >
            <Instagram className="h-5 w-5" />
            <span className="sr-only">Share on Instagram</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-600" 
            onClick={() => shareToSocial("email")}
          >
            <Mail className="h-5 w-5" />
            <span className="sr-only">Share via Email</span>
          </Button>
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button className="gap-1" onClick={() => window.open(imageUrl, "_blank")}>
            <Download className="h-4 w-4" />
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}