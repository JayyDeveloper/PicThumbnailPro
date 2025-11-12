import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  Image, 
  Youtube, 
  PenTool, 
  Download, 
  Crop,
  Sparkles
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function Home() {
  const [_, setLocation] = useLocation();
  const { user } = useAuth();

  const handleEditorClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user) {
      setLocation("/editor");
    } else {
      setLocation("/auth");
    }
  };
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-400/10 via-transparent to-transparent"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-transparent bg-clip-text">
                Create Eye-Catching YouTube Thumbnails
              </span>
              <br />
              <span className="text-foreground">with AI-Powered Image Generation</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Generate stunning AI images and transform them into optimized YouTube thumbnails with our easy-to-use editor.
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-lg shadow-blue-500/50 rounded-2xl px-8 py-6 text-lg"
              onClick={handleEditorClick}
            >
              Start Creating <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-50/30 to-transparent dark:via-purple-950/10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group text-center p-8 bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-900 dark:to-blue-950/20 rounded-3xl border border-blue-200/50 dark:border-blue-800/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="mb-4 text-primary inline-flex p-4 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40 rounded-2xl shadow-md">
                <Sparkles className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Generate AI Images</h3>
              <p className="text-muted-foreground">
                Create unique, high-quality images using our AI image generation technology.
              </p>
            </div>
            <div className="group text-center p-8 bg-gradient-to-br from-white to-purple-50/50 dark:from-gray-900 dark:to-purple-950/20 rounded-3xl border border-purple-200/50 dark:border-purple-800/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="mb-4 text-primary inline-flex p-4 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 rounded-2xl shadow-md">
                <PenTool className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Customize Your Thumbnail</h3>
              <p className="text-muted-foreground">
                Add text, apply filters, and make adjustments to make your thumbnail stand out.
              </p>
            </div>
            <div className="group text-center p-8 bg-gradient-to-br from-white to-pink-50/50 dark:from-gray-900 dark:to-pink-950/20 rounded-3xl border border-pink-200/50 dark:border-pink-800/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="mb-4 text-primary inline-flex p-4 bg-gradient-to-br from-pink-100 to-red-100 dark:from-pink-900/40 dark:to-red-900/40 rounded-2xl shadow-md">
                <Download className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Download & Use</h3>
              <p className="text-muted-foreground">
                Export your thumbnail in the perfect YouTube dimensions (1280x720px).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-blue-950/30 dark:via-purple-950/30 dark:to-pink-950/30"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="p-10 md:p-12 bg-gradient-to-br from-blue-600/90 to-purple-600/90 backdrop-blur-sm rounded-3xl text-white max-w-4xl mx-auto shadow-2xl border border-white/20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Create Your Thumbnail?</h2>
            <p className="text-blue-50 mb-8 text-lg">
              Start with our free editor and create professional YouTube thumbnails with AI-generated images today.
            </p>
            <Button
              size="lg"
              className="bg-white text-purple-600 hover:bg-gray-100 rounded-2xl px-8 py-6 text-lg shadow-lg font-semibold"
              onClick={handleEditorClick}
            >
              Go to Editor <Youtube className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-16 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-blue-50/50 to-transparent dark:from-blue-950/20 dark:to-transparent"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">Key Features</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start p-6 rounded-2xl bg-gradient-to-br from-white to-blue-50/80 dark:from-gray-900 dark:to-blue-950/20 border border-blue-200/50 dark:border-blue-800/30 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-3 rounded-xl mr-4 shadow-md">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">AI Image Generation</h3>
                <p className="text-muted-foreground">
                  Create unique, high-quality images for your thumbnails using advanced AI technology.
                </p>
              </div>
            </div>
            <div className="flex items-start p-6 rounded-2xl bg-gradient-to-br from-white to-purple-50/80 dark:from-gray-900 dark:to-purple-950/20 border border-purple-200/50 dark:border-purple-800/30 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-xl mr-4 shadow-md">
                <Crop className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Perfect Dimensions</h3>
                <p className="text-muted-foreground">
                  All thumbnails are optimized for YouTube's recommended 1280x720 pixel dimensions.
                </p>
              </div>
            </div>
            <div className="flex items-start p-6 rounded-2xl bg-gradient-to-br from-white to-pink-50/80 dark:from-gray-900 dark:to-pink-950/20 border border-pink-200/50 dark:border-pink-800/30 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="bg-gradient-to-br from-pink-500 to-red-500 p-3 rounded-xl mr-4 shadow-md">
                <PenTool className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Text Customization</h3>
                <p className="text-muted-foreground">
                  Add eye-catching text with custom fonts, sizes, colors, and styles.
                </p>
              </div>
            </div>
            <div className="flex items-start p-6 rounded-2xl bg-gradient-to-br from-white to-green-50/80 dark:from-gray-900 dark:to-green-950/20 border border-green-200/50 dark:border-green-800/30 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-3 rounded-xl mr-4 shadow-md">
                <Download className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Quick Export</h3>
                <p className="text-muted-foreground">
                  Download your thumbnail in high-quality format ready for YouTube upload.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
