import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Image,
  Youtube,
  PenTool,
  Download,
  Crop,
  Sparkles,
  Zap,
  Target,
  TrendingUp,
  Award,
  CheckCircle2
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
      {/* Hero Section with Mesh Gradient */}
      <section className="relative overflow-hidden py-20 md:py-32">
        {/* Animated Mesh Gradient Background */}
        <div className="absolute inset-0 gradient-mesh-1 opacity-60"></div>

        <div className="container relative mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 badge-gradient-primary mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Sparkles className="h-4 w-4" />
              <span>AI-Powered Thumbnail Generator</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
              Create{" "}
              <span className="text-gradient-aurora">
                Viral Thumbnails
              </span>
              <br />
              That Get Clicks
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              Upload your image, get AI-powered analysis, and receive 3 viral video strategies
              with SEO-optimized titles, tags, and descriptions
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
              <Button
                size="lg"
                className="btn-gradient-primary px-8 py-6 text-lg"
                onClick={handleEditorClick}
              >
                Start Creating Free <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Link href="/ai-thumbnail">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-modern px-8 py-6 text-lg hover-lift"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Try AI Generator
                </Button>
              </Link>
            </div>

            {/* Social Proof */}
            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground animate-in fade-in duration-700 delay-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>1 Free Token</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>No Credit Card</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>GPT-4 Powered</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              How It <span className="text-gradient">Works</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to create professional YouTube thumbnails
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Step 1 */}
            <div className="card-modern p-8 hover-lift group">
              <div className="gradient-primary rounded-modern-lg p-4 w-16 h-16 flex items-center justify-center mb-6 shadow-glow group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <div className="badge-gradient-accent mb-4 inline-block">Step 1</div>
              <h3 className="text-2xl font-bold mb-3">Generate or Upload</h3>
              <p className="text-muted-foreground">
                Use AI to generate unique images from text prompts, or upload your own image to enhance
              </p>
            </div>

            {/* Step 2 */}
            <div className="card-modern p-8 hover-lift group">
              <div className="gradient-accent rounded-modern-lg p-4 w-16 h-16 flex items-center justify-center mb-6 shadow-glow group-hover:scale-110 transition-transform duration-300">
                <PenTool className="h-8 w-8 text-white" />
              </div>
              <div className="badge-gradient-primary mb-4 inline-block">Step 2</div>
              <h3 className="text-2xl font-bold mb-3">Customize & Optimize</h3>
              <p className="text-muted-foreground">
                Add text overlays, apply filters, and get AI-powered suggestions for viral content
              </p>
            </div>

            {/* Step 3 */}
            <div className="card-modern p-8 hover-lift group">
              <div className="gradient-success rounded-modern-lg p-4 w-16 h-16 flex items-center justify-center mb-6 shadow-glow group-hover:scale-110 transition-transform duration-300">
                <Download className="h-8 w-8 text-white" />
              </div>
              <div className="badge-gradient-accent mb-4 inline-block">Step 3</div>
              <h3 className="text-2xl font-bold mb-3">Export & Go Viral</h3>
              <p className="text-muted-foreground">
                Download your optimized thumbnail with viral titles, tags, and descriptions ready to use
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-muted/30 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 gradient-mesh-2 opacity-40"></div>

        <div className="container relative mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Powerful <span className="text-gradient-accent">Features</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to create thumbnails that convert viewers into subscribers
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {/* Feature 1 */}
            <div className="card-gradient p-6 hover-lift">
              <div className="bg-blue-500/10 p-3 rounded-modern w-12 h-12 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">AI Image Analysis</h3>
              <p className="text-muted-foreground">
                GPT-4 Vision analyzes your images and suggests professional improvements
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card-gradient p-6 hover-lift">
              <div className="bg-purple-500/10 p-3 rounded-modern w-12 h-12 flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Viral Strategies</h3>
              <p className="text-muted-foreground">
                Get 3 different approaches: Curiosity, Value, and Entertainment-driven
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card-gradient p-6 hover-lift">
              <div className="bg-pink-500/10 p-3 rounded-modern w-12 h-12 flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-pink-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">SEO Optimization</h3>
              <p className="text-muted-foreground">
                Receive optimized titles, tags, and descriptions for maximum reach
              </p>
            </div>

            {/* Feature 4 */}
            <div className="card-gradient p-6 hover-lift">
              <div className="bg-green-500/10 p-3 rounded-modern w-12 h-12 flex items-center justify-center mb-4">
                <PenTool className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Text Overlays</h3>
              <p className="text-muted-foreground">
                Add custom text with rich formatting, fonts, colors, and effects
              </p>
            </div>

            {/* Feature 5 */}
            <div className="card-gradient p-6 hover-lift">
              <div className="bg-yellow-500/10 p-3 rounded-modern w-12 h-12 flex items-center justify-center mb-4">
                <Crop className="h-6 w-6 text-yellow-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Perfect Dimensions</h3>
              <p className="text-muted-foreground">
                All thumbnails optimized for YouTube's 1280x720px requirement
              </p>
            </div>

            {/* Feature 6 */}
            <div className="card-gradient p-6 hover-lift">
              <div className="bg-red-500/10 p-3 rounded-modern w-12 h-12 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Instant Export</h3>
              <p className="text-muted-foreground">
                Download high-quality PNG files ready for immediate upload
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 gradient-primary opacity-10"></div>

        <div className="container relative mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="card-modern p-12 text-center shadow-strong">
              <div className="inline-flex items-center gap-2 badge-gradient-primary mb-6">
                <Award className="h-4 w-4" />
                <span>Start Free Today</span>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to Create <span className="text-gradient-aurora">Viral Thumbnails?</span>
              </h2>

              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join creators who are increasing their click-through rates with AI-powered thumbnails.
                Start with 1 free token—no credit card required.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="btn-gradient-primary px-10 py-6 text-lg"
                  onClick={handleEditorClick}
                >
                  <Youtube className="mr-2 h-6 w-6" />
                  Start Creating
                </Button>
                <Link href="/pricing">
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-modern px-10 py-6 text-lg hover-lift"
                  >
                    View Pricing
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="mt-12 grid grid-cols-3 gap-8 pt-8 border-t border-border/50">
                <div>
                  <div className="text-3xl font-bold text-gradient">GPT-4</div>
                  <div className="text-sm text-muted-foreground mt-1">AI Powered</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gradient-accent">2 Tokens</div>
                  <div className="text-sm text-muted-foreground mt-1">AI Generation</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gradient-aurora">3 Strategies</div>
                  <div className="text-sm text-muted-foreground mt-1">Per Request</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
