import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Sparkles, Upload, Wand2, TrendingUp, Hash, FileText, Copy, Check } from "lucide-react";

interface ThumbnailSuggestion {
  title: string;
  tags: string[];
  description: string;
}

interface AIResponse {
  success: boolean;
  enhancedImageUrl: string;
  imageId: number;
  analysis: string;
  suggestions: ThumbnailSuggestion[];
  textOverlays: string[];
  pointsUsed: number;
  remainingPoints: number;
  message: string;
}

export default function AIThumbnailPage() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [prompt, setPrompt] = useState("");
  const [aiResult, setAiResult] = useState<AIResponse | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<{ [key: string]: boolean }>({});

  // Check AI service status
  const { data: aiStatus } = useQuery({
    queryKey: ['/api/ai-status'],
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please upload an image file (JPG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const generateThumbnailMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile || !prompt.trim()) {
        throw new Error("Please upload an image and provide a description");
      }

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('prompt', prompt);

      const response = await fetch('/api/ai-generate-thumbnail', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || error.error || 'Failed to generate thumbnail');
      }

      return response.json();
    },
    onSuccess: (data: AIResponse) => {
      setAiResult(data);
      toast({
        title: "✨ AI Thumbnail Generated!",
        description: `Used ${data.pointsUsed} tokens. ${data.remainingPoints} tokens remaining.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex({ ...copiedIndex, [key]: true });
    setTimeout(() => {
      setCopiedIndex({ ...copiedIndex, [key]: false });
    }, 2000);
    toast({
      title: "Copied!",
      description: "Text copied to clipboard",
    });
  };

  const handleUseInEditor = () => {
    if (aiResult) {
      setLocation(`/editor?imageUrl=${encodeURIComponent(aiResult.enhancedImageUrl)}`);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Login Required</CardTitle>
            <CardDescription>
              Please log in to access AI thumbnail generation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation('/auth')} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (aiStatus && typeof aiStatus === 'object' && 'enabled' in aiStatus && !(aiStatus as any).enabled) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>AI Service Unavailable</CardTitle>
            <CardDescription>
              OpenAI API is not configured. Please contact support.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-purple-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
              AI Thumbnail Generator
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Upload your image, describe your video, and get viral-optimized thumbnails with SEO suggestions
          </p>
          <div className="mt-4 flex items-center justify-center gap-4">
            <Badge variant="secondary" className="text-sm">
              <Wand2 className="h-4 w-4 mr-1" />
              Costs 2 Tokens
            </Badge>
            <Badge variant="outline" className="text-sm">
              Your Balance: {user.points} tokens
            </Badge>
          </div>
        </div>

        {!aiResult ? (
          // Upload and Generate Section
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle>Step 1: Upload & Describe</CardTitle>
              <CardDescription>
                Upload your base image and describe what your video is about
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Upload Image
                </label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
                  {previewUrl ? (
                    <div className="space-y-4">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-h-64 mx-auto rounded-lg shadow-lg"
                      />
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedFile(null);
                          setPreviewUrl("");
                        }}
                      >
                        Remove Image
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-2">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG, GIF up to 5MB
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="file-upload"
                      />
                      <Button
                        onClick={() => document.getElementById('file-upload')?.click()}
                        className="mt-4"
                      >
                        Choose File
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Prompt Input */}
              <div>
                <label htmlFor="prompt" className="block text-sm font-medium mb-2">
                  Video Description / Concept
                </label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Example: This is a gaming video about beating the hardest level in Elden Ring. I want the thumbnail to look epic, dramatic, and make people curious about how I did it..."
                  className="w-full h-32 p-4 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Be specific! Include your video topic, target audience, and desired mood.
                </p>
              </div>

              {/* Generate Button */}
              <Button
                onClick={() => generateThumbnailMutation.mutate()}
                disabled={!selectedFile || !prompt.trim() || generateThumbnailMutation.isPending || (user.points < 2)}
                className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:opacity-90 text-white font-bold py-6 text-lg"
              >
                {generateThumbnailMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Generating with AI...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Generate AI Thumbnail (2 Tokens)
                  </div>
                )}
              </Button>

              {user.points < 2 && (
                <p className="text-center text-sm text-destructive">
                  Insufficient tokens. <a href="/pricing" className="underline">Get more tokens</a>
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          // Results Section
          <div className="space-y-6">
            {/* Enhanced Image */}
            <Card>
              <CardHeader>
                <CardTitle>Your AI-Enhanced Thumbnail</CardTitle>
                <CardDescription>
                  {aiResult.message}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <img
                    src={aiResult.enhancedImageUrl}
                    alt="AI Enhanced Thumbnail"
                    className="w-full rounded-lg shadow-2xl"
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleUseInEditor} className="flex-1">
                      <Wand2 className="h-4 w-4 mr-2" />
                      Edit in Thumbnail Editor
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setAiResult(null);
                        setSelectedFile(null);
                        setPreviewUrl("");
                        setPrompt("");
                      }}
                    >
                      Generate Another
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  AI Analysis & Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {aiResult.analysis}
                </p>
              </CardContent>
            </Card>

            {/* Text Overlay Suggestions */}
            {aiResult.textOverlays && aiResult.textOverlays.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Suggested Text Overlays</CardTitle>
                  <CardDescription>
                    Punchy text to add to your thumbnail
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {aiResult.textOverlays.map((text, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="text-lg py-2 px-4 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                        onClick={() => copyToClipboard(text, `text-${i}`)}
                      >
                        {text}
                        {copiedIndex[`text-${i}`] ? (
                          <Check className="h-4 w-4 ml-2" />
                        ) : (
                          <Copy className="h-4 w-4 ml-2" />
                        )}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Viral Suggestions */}
            <Card>
              <CardHeader>
                <CardTitle>3 Viral Video Strategies</CardTitle>
                <CardDescription>
                  Choose the approach that fits your style
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="0" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="0">Curiosity 🧠</TabsTrigger>
                    <TabsTrigger value="1">Value 💎</TabsTrigger>
                    <TabsTrigger value="2">Entertainment 🎬</TabsTrigger>
                  </TabsList>

                  {aiResult.suggestions.map((suggestion, index) => (
                    <TabsContent key={index} value={String(index)} className="space-y-4 mt-4">
                      {/* Title */}
                      <div>
                        <label className="text-sm font-medium flex items-center gap-2 mb-2">
                          <FileText className="h-4 w-4" />
                          Video Title
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={suggestion.title}
                            readOnly
                            className="w-full p-3 pr-10 border border-border rounded-lg bg-muted"
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            className="absolute right-1 top-1"
                            onClick={() => copyToClipboard(suggestion.title, `title-${index}`)}
                          >
                            {copiedIndex[`title-${index}`] ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Tags */}
                      <div>
                        <label className="text-sm font-medium flex items-center gap-2 mb-2">
                          <Hash className="h-4 w-4" />
                          SEO Tags
                        </label>
                        <div className="relative">
                          <div className="p-3 pr-10 border border-border rounded-lg bg-muted flex flex-wrap gap-2">
                            {suggestion.tags.map((tag, i) => (
                              <Badge key={i} variant="outline">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="absolute right-1 top-1"
                            onClick={() => copyToClipboard(suggestion.tags.join(', '), `tags-${index}`)}
                          >
                            {copiedIndex[`tags-${index}`] ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <label className="text-sm font-medium flex items-center gap-2 mb-2">
                          <FileText className="h-4 w-4" />
                          Video Description
                        </label>
                        <div className="relative">
                          <textarea
                            value={suggestion.description}
                            readOnly
                            className="w-full h-32 p-3 pr-10 border border-border rounded-lg bg-muted resize-none"
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            className="absolute right-1 top-1"
                            onClick={() => copyToClipboard(suggestion.description, `desc-${index}`)}
                          >
                            {copiedIndex[`desc-${index}`] ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          const allText = `Title: ${suggestion.title}\n\nTags: ${suggestion.tags.join(', ')}\n\nDescription:\n${suggestion.description}`;
                          copyToClipboard(allText, `all-${index}`);
                        }}
                      >
                        {copiedIndex[`all-${index}`] ? (
                          <><Check className="h-4 w-4 mr-2" /> Copied All!</>
                        ) : (
                          <><Copy className="h-4 w-4 mr-2" /> Copy All</>
                        )}
                      </Button>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
