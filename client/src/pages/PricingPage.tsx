import { Link } from "wouter";
import { Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

// Pricing tiers with different features and benefits
const pricingTiers = [
  {
    name: "Starter",
    description: "Perfect for trying out our service.",
    price: "Free",
    features: [
      "1 free thumbnail",
      "Standard quality exports",
      "Basic editing tools",
      "Community support",
    ],
    buttonText: "Get Started",
    buttonVariant: "outline" as const,
    highlightedFeature: "1 Point Included",
  },
  {
    name: "Gold",
    description: "Great for YouTubers who post weekly.",
    price: "$4.99",
    features: [
      "5 thumbnails",
      "High quality exports",
      "Advanced editing tools",
      "Priority support",
      "Save & resume projects",
      "Basic AI image generation",
    ],
    buttonText: "Upgrade Now",
    buttonVariant: "default" as const,
    highlightedFeature: "5 Points",
  },
  {
    name: "Platinum",
    description: "For serious content creators.",
    price: "$9.99",
    features: [
      "15 thumbnails",
      "Premium quality exports",
      "All editing tools",
      "Priority support",
      "Save unlimited projects",
      "Custom templates",
      "Advanced AI image generation",
      "AI style transfer",
    ],
    buttonText: "Upgrade Now",
    buttonVariant: "default" as const,
    highlightedFeature: "15 Points",
  },
  {
    name: "Ultimate",
    description: "For professional channels and teams.",
    price: "$19.99",
    features: [
      "50 thumbnails",
      "Maximum quality exports",
      "All premium features",
      "24/7 priority support",
      "Team collaboration",
      "Custom branding",
      "Analytics integration",
      "Premium AI image generation",
      "AI style transfer",
      "AI background removal",
      "AI text generation",
    ],
    buttonText: "Upgrade Now",
    buttonVariant: "default" as const,
    highlightedFeature: "50 Points",
    popular: true,
  },
];

export default function PricingPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const handleFreePlanClick = async () => {
    if (!user) {
      window.location.href = '/auth';
      return;
    }

    try {
      const response = await fetch('/api/debug/set-points/' + user.id, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ points: (user.points || 0) + 1 })
      });

      if (!response.ok) {
        throw new Error('Failed to add point');
      }

      const data = await response.json();
      
      toast({
        title: 'Point Added',
        description: `You now have ${data.points} points!`,
      });

      // Reload the page to update the points display
      window.location.reload();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add point. Please try again.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-purple-400/10 via-transparent to-transparent"></div>

      <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
              Simple, transparent pricing
            </span>
          </h1>
          <p className="mt-4 text-xl text-muted-foreground">
            Choose the perfect plan for your YouTube content creation needs
          </p>
        </div>

      <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {pricingTiers.map((tier, index) => {
          const gradients = [
            'from-blue-500/10 to-cyan-500/10',
            'from-amber-500/10 to-yellow-500/10',
            'from-purple-500/10 to-pink-500/10',
            'from-indigo-500/10 to-purple-500/10'
          ];
          const borderGradients = [
            'border-blue-200 dark:border-blue-800/30',
            'border-amber-200 dark:border-amber-800/30',
            'border-purple-200 dark:border-purple-800/30',
            'border-indigo-200 dark:border-indigo-800/30'
          ];
          return (
          <div
            key={tier.name}
            className={`group relative rounded-3xl border-2 ${
              tier.popular ? "border-purple-500 shadow-2xl shadow-purple-500/20 scale-105" : borderGradients[index]
            } bg-gradient-to-br ${gradients[index]} dark:from-gray-900/80 dark:to-gray-800/80 backdrop-blur-sm p-8 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1`}
          >
            {tier.popular && (
              <div className="absolute -top-4 left-0 right-0 flex justify-center">
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-5 py-2 rounded-full inline-flex items-center shadow-lg">
                  <Zap size={14} className="mr-1" />
                  MOST POPULAR
                </span>
              </div>
            )}
            <div>
              <h3 className="text-xl font-bold text-foreground">{tier.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{tier.description}</p>
              <p className="mt-6">
                <span className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">{tier.price}</span>
                {tier.price !== "Free" && (
                  <span className="text-sm text-muted-foreground ml-1">one-time</span>
                )}
              </p>
              <div className="mt-3 py-2 px-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 rounded-xl inline-block border border-blue-200/50 dark:border-blue-700/30">
                <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">{tier.highlightedFeature}</span>
              </div>
              <ul className="mt-6 space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="p-1 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    </div>
                    <p className="ml-3 text-sm text-foreground/90">{feature}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-8">
              {tier.name === "Starter" ? (
                <Button
                  variant={tier.buttonVariant}
                  className={`w-full ${
                    tier.buttonVariant === "default" ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white" : ""
                  }`}
                  onClick={handleFreePlanClick}
                >
                  {tier.buttonText}
                </Button>
              ) : (
                <Button
                  variant={tier.buttonVariant}
                  className={`w-full ${
                    tier.buttonVariant === "default" ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white" : ""
                  }`}
                  asChild
                >
                  <Link href="/auth">{tier.buttonText}</Link>
                </Button>
              )}
            </div>
          </div>
        )})}
      </div>

      <div className="mt-20 text-center">
        <h3 className="text-3xl font-bold text-foreground mb-4">Frequently Asked Questions</h3>
        <p className="text-muted-foreground mb-10">Everything you need to know about our plans</p>
        <div className="mt-8 max-w-3xl mx-auto grid gap-6 sm:grid-cols-2">
          <div className="text-left p-6 rounded-2xl bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-900 dark:to-blue-950/20 border border-blue-200/50 dark:border-blue-800/30 shadow-md hover:shadow-lg transition-all">
            <h4 className="text-lg font-semibold text-foreground flex items-center">
              <span className="mr-2 text-2xl">💎</span> How do points work?
            </h4>
            <p className="mt-3 text-muted-foreground">
              Each point allows you to create and export one thumbnail. You can purchase
              points in bundles, and they never expire.
            </p>
          </div>
          <div className="text-left p-6 rounded-2xl bg-gradient-to-br from-white to-purple-50/50 dark:from-gray-900 dark:to-purple-950/20 border border-purple-200/50 dark:border-purple-800/30 shadow-md hover:shadow-lg transition-all">
            <h4 className="text-lg font-semibold text-foreground flex items-center">
              <span className="mr-2 text-2xl">🚀</span> Can I upgrade my plan later?
            </h4>
            <p className="mt-3 text-muted-foreground">
              Yes, you can purchase additional points at any time. We also offer
              special discounts for returning customers.
            </p>
          </div>
          <div className="text-left p-6 rounded-2xl bg-gradient-to-br from-white to-pink-50/50 dark:from-gray-900 dark:to-pink-950/20 border border-pink-200/50 dark:border-pink-800/30 shadow-md hover:shadow-lg transition-all">
            <h4 className="text-lg font-semibold text-foreground flex items-center">
              <span className="mr-2 text-2xl">⏰</span> Do points expire?
            </h4>
            <p className="mt-3 text-muted-foreground">
              No, your points will never expire. Use them whenever you need to create
              new thumbnails.
            </p>
          </div>
          <div className="text-left p-6 rounded-2xl bg-gradient-to-br from-white to-green-50/50 dark:from-gray-900 dark:to-green-950/20 border border-green-200/50 dark:border-green-800/30 shadow-md hover:shadow-lg transition-all">
            <h4 className="text-lg font-semibold text-foreground flex items-center">
              <span className="mr-2 text-2xl">🛒</span> How do I get more points?
            </h4>
            <p className="mt-3 text-muted-foreground">
              You can purchase additional points from your account dashboard at any time
              using our secure payment system.
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}