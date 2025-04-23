import { Link } from "wouter";
import { Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    ],
    buttonText: "Upgrade Now",
    buttonVariant: "default" as const,
    highlightedFeature: "5 Points",
    popular: true,
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
    ],
    buttonText: "Upgrade Now",
    buttonVariant: "default" as const,
    highlightedFeature: "50 Points",
  },
];

export default function PricingPage() {
  return (
    <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Simple, transparent pricing
          </span>
        </h1>
        <p className="mt-4 text-xl text-gray-600">
          Choose the perfect plan for your YouTube content creation needs
        </p>
      </div>

      <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {pricingTiers.map((tier) => (
          <div
            key={tier.name}
            className={`relative rounded-2xl border ${
              tier.popular ? "border-primary shadow-xl" : "border-gray-200"
            } bg-white p-8 shadow-sm flex flex-col justify-between`}
          >
            {tier.popular && (
              <div className="absolute -top-4 left-0 right-0 flex justify-center">
                <span className="bg-primary text-white text-xs font-semibold px-4 py-1 rounded-full inline-flex items-center">
                  <Zap size={12} className="mr-1" />
                  MOST POPULAR
                </span>
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{tier.name}</h3>
              <p className="mt-2 text-sm text-gray-500">{tier.description}</p>
              <p className="mt-6">
                <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                {tier.price !== "Free" && (
                  <span className="text-sm text-gray-500 ml-1">one-time</span>
                )}
              </p>
              <div className="mt-2 py-2 px-4 bg-gray-50 rounded-lg inline-block">
                <span className="text-sm font-medium text-primary">{tier.highlightedFeature}</span>
              </div>
              <ul className="mt-6 space-y-4">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <div className="flex-shrink-0">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="ml-3 text-sm text-gray-700">{feature}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-8">
              <Button
                variant={tier.buttonVariant}
                className={`w-full ${
                  tier.buttonVariant === "default" ? "bg-primary hover:bg-primary/90" : ""
                }`}
                asChild
              >
                <Link href="/auth">{tier.buttonText}</Link>
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 text-center">
        <h3 className="text-2xl font-semibold text-gray-900">Frequently Asked Questions</h3>
        <div className="mt-8 max-w-3xl mx-auto grid gap-6 sm:grid-cols-2">
          <div className="text-left">
            <h4 className="text-lg font-medium text-gray-900">How do points work?</h4>
            <p className="mt-2 text-gray-600">
              Each point allows you to create and export one thumbnail. You can purchase 
              points in bundles, and they never expire.
            </p>
          </div>
          <div className="text-left">
            <h4 className="text-lg font-medium text-gray-900">Can I upgrade my plan later?</h4>
            <p className="mt-2 text-gray-600">
              Yes, you can purchase additional points at any time. We also offer
              special discounts for returning customers.
            </p>
          </div>
          <div className="text-left">
            <h4 className="text-lg font-medium text-gray-900">Do points expire?</h4>
            <p className="mt-2 text-gray-600">
              No, your points will never expire. Use them whenever you need to create
              new thumbnails.
            </p>
          </div>
          <div className="text-left">
            <h4 className="text-lg font-medium text-gray-900">How do I get more points?</h4>
            <p className="mt-2 text-gray-600">
              You can purchase additional points from your account dashboard at any time
              using our secure payment system.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}