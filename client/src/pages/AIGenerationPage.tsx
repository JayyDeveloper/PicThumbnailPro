import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Upload, Image as ImageIcon, Sparkles, Zap } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function AIGenerationPage() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [useAI, setUseAI] = useState(false);

  const generateThumbnailMutation = useMutation({
    mutationFn: async ({ image, text, useAI }: { image: File | null; text: string; useAI: boolean }) => {
      const formData = new FormData();

      if (image) {
        formData.append("image", image);
      }
      formData.append("text", text);
      formData.append("useAI", useAI.toString());

      const response = await fetch("/api/generate-thumbnail", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Thumbnail generation failed");
      }

      return response.json();
    },
    onSuccess: (data) => {
      setIsGenerating(false);
      setLocation(`/editor?imageUrl=${encodeURIComponent(data.url)}`);
      toast({
        title: "Thumbnail Generated",
        description: "AI has created a high-quality YouTube thumbnail.",
      });
    },
    onError: (error) => {
      setIsGenerating(false);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate thumbnail. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid File",
          description: "Please upload an image file.",
          variant: "destructive",
        });
        return;
      }

      setUploadedImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setUploadedImage(null);
    setImagePreview("");
  };

  const handleGenerate = () => {
    if (!prompt.trim() && !uploadedImage) {
      toast({
        title: "Missing Input",
        description: "Please upload an image and/or enter text for your thumbnail.",
        variant: "destructive",
      });
      return;
    }

    if (useAI && !uploadedImage && !prompt.trim()) {
      toast({
        title: "AI Generation Requires Text",
        description: "Please provide a description for AI to generate a background image.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    generateThumbnailMutation.mutate({ image: uploadedImage, text: prompt, useAI });
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-red-950/20"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-purple-400/10 via-transparent to-transparent"></div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 py-16">
        <div className="max-w-4xl w-full bg-gradient-to-br from-white/90 to-purple-50/90 dark:from-gray-900/90 dark:to-purple-950/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 border border-purple-200/50 dark:border-purple-800/30">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg mb-4">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3">
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
                AI Thumbnail Generator
              </span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Upload an image, describe your topic, and AI creates viral thumbnail text & backgrounds
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Image Upload Section */}
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-foreground mb-2 flex items-center">
                <ImageIcon className="h-4 w-4 mr-2 text-purple-600" />
                Upload Your Image
              </label>

              {imagePreview ? (
                <div className="relative group">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-2xl border-2 border-purple-200 dark:border-purple-800/50 shadow-md"
                  />
                  <button
                    onClick={clearImage}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✕
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 rounded-b-2xl">
                    <p className="text-white text-sm font-medium truncate">
                      {uploadedImage?.name}
                    </p>
                  </div>
                </div>
              ) : (
                <label className="block cursor-pointer">
                  <div className="w-full h-48 border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-2xl flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 hover:border-purple-500 dark:hover:border-purple-500 transition-all group">
                    <Upload className="h-12 w-12 text-purple-400 group-hover:text-purple-600 mb-3" />
                    <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                      Click to upload image
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Text Input Section */}
            <div className="space-y-4">
              <label htmlFor="prompt" className="block text-sm font-semibold text-foreground mb-2 flex items-center">
                <Sparkles className="h-4 w-4 mr-2 text-pink-600" />
                Video Topic Description
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your video topic and AI will create viral thumbnail text...

Example: 'I made $10,000 in one day trading crypto'
AI will create: '10K IN 24 HRS'

Example: 'My secret morning routine that changed my life'
AI will create: 'SECRET ROUTINE'"
                className="w-full h-48 p-4 border-2 border-purple-200 dark:border-purple-800/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm"
              />
              <div className="flex items-start space-x-2 text-xs text-muted-foreground bg-blue-50/50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-200 dark:border-blue-800/30">
                <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <p>
                  <strong>AI Magic:</strong> Describe your video topic and our AI will create short, punchy viral text + choose colors that match your content!
                </p>
              </div>
            </div>
          </div>

          {/* AI Generation Toggle */}
          {!uploadedImage && (
            <div className="flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-amber-100/50 to-yellow-100/50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-2xl border border-amber-200 dark:border-amber-800/30">
              <Zap className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <Label htmlFor="ai-toggle" className="text-sm font-semibold text-foreground cursor-pointer">
                Use DALL-E 3 to generate AI background
              </Label>
              <Switch
                id="ai-toggle"
                checked={useAI}
                onCheckedChange={setUseAI}
              />
            </div>
          )}

          <div className="flex flex-col items-center space-y-4">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              size="lg"
              className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white font-bold py-6 px-12 rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <div className="flex items-center">
                  <div className="h-5 w-5 mr-3 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Generating Thumbnail...
                </div>
              ) : (
                <div className="flex items-center">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Generate High-Quality Thumbnail
                </div>
              )}
            </Button>

            <div className="text-center">
              <div className="inline-flex items-center space-x-6 text-sm text-muted-foreground bg-purple-100/50 dark:bg-purple-900/20 px-6 py-3 rounded-xl">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  High Quality (1280x720)
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  YouTube Optimized
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 