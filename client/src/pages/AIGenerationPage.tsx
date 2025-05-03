import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function AIGenerationPage() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateImageMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await apiRequest("POST", "/api/generate-image", { prompt });
      
      if (!response.ok) {
        throw new Error("Image generation failed");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setIsGenerating(false);
      setLocation(`/editor?imageUrl=${encodeURIComponent(data.url)}`);
      toast({
        title: "Image Generated",
        description: "AI has created an image based on your prompt.",
      });
    },
    onError: (error) => {
      setIsGenerating(false);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate an image. Please try a different prompt.",
        variant: "destructive",
      });
    }
  });

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast({
        title: "Empty Prompt",
        description: "Please enter a description of the image you want to generate.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    generateImageMutation.mutate(prompt);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-card rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
          AI Thumbnail Generator
        </h1>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-foreground mb-2">
              Describe your thumbnail
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Example: A gaming thumbnail with neon lights, futuristic design, and dramatic lighting..."
              className="w-full h-32 p-4 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          <div className="flex justify-center">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white font-bold py-3 px-8 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isGenerating ? (
                <div className="flex items-center">
                  <div className="h-5 w-5 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Generating...
                </div>
              ) : (
                "Generate Thumbnail"
              )}
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>Your generated image will be automatically loaded into the editor</p>
            <p className="mt-2">Tip: Be specific with your description for better results</p>
          </div>
        </div>
      </div>
    </div>
  );
} 