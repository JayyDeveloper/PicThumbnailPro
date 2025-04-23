import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  Image, 
  Youtube, 
  PenTool, 
  Download, 
  Crop 
} from "lucide-react";

export default function Home() {
  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Create Eye-Catching YouTube Thumbnails in Minutes
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Upload reference images and transform them into optimized YouTube thumbnails with our easy-to-use editor.
            </p>
            <Link href="/editor">
              <Button size="lg" className="bg-primary hover:bg-blue-600">
                Start Creating <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="mb-4 text-primary inline-flex p-3 bg-blue-50 rounded-full">
                <Image className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Upload Reference Images</h3>
              <p className="text-gray-600">
                Drag and drop your reference images or choose from our stock photo library.
              </p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="mb-4 text-primary inline-flex p-3 bg-blue-50 rounded-full">
                <PenTool className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Customize Your Thumbnail</h3>
              <p className="text-gray-600">
                Add text, apply filters, and make adjustments to make your thumbnail stand out.
              </p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="mb-4 text-primary inline-flex p-3 bg-blue-50 rounded-full">
                <Download className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Download & Use</h3>
              <p className="text-gray-600">
                Export your thumbnail in the perfect YouTube dimensions (1280x720px).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <div className="p-8 bg-gray-900 rounded-xl text-white max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Ready to Create Your Thumbnail?</h2>
            <p className="text-gray-300 mb-8">
              Start with our free editor and create professional YouTube thumbnails today.
            </p>
            <Link href="/editor">
              <Button size="lg" className="bg-primary hover:bg-blue-600">
                Go to Editor <Youtube className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex items-start">
              <div className="bg-blue-100 p-2 rounded mr-4">
                <Crop className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Perfect Dimensions</h3>
                <p className="text-gray-600">
                  All thumbnails are optimized for YouTube's recommended 1280x720 pixel dimensions.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-blue-100 p-2 rounded mr-4">
                <Image className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Stock Photo Library</h3>
                <p className="text-gray-600">
                  Access our collection of high-quality stock images for social media and content creation.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-blue-100 p-2 rounded mr-4">
                <PenTool className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Text Customization</h3>
                <p className="text-gray-600">
                  Add eye-catching text with custom fonts, sizes, colors, and styles.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-blue-100 p-2 rounded mr-4">
                <Download className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Quick Export</h3>
                <p className="text-gray-600">
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
