
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    description: "Basic features for occasional users",
    features: [
      "1GB storage limit",
      "2 Simultaneous downloads",
      "Standard speed",
      "24 hour file retention",
    ],
    buttonText: "Get Started",
    popular: false,
  },
  {
    name: "Premium",
    price: "$9.99",
    period: "month",
    description: "Everything you need for regular usage",
    features: [
      "100GB storage limit",
      "Unlimited downloads",
      "High-speed servers",
      "7 day file retention",
      "Priority support",
    ],
    buttonText: "Upgrade Now",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$29.99",
    period: "month",
    description: "Advanced features for power users",
    features: [
      "1TB storage limit",
      "Unlimited downloads",
      "Maximum speed",
      "30 day file retention",
      "24/7 premium support",
      "API access",
    ],
    buttonText: "Contact Sales",
    popular: false,
  },
];

const Pricing = () => {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

  return (
    <div className="w-full max-w-6xl mx-auto py-16">
      <div className="text-center mb-12">
        <h2 className="text-2xl font-bold mb-4 gradient-text">Choose Your Plan</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Select the perfect plan for your needs. All plans include our core features.
        </p>
      </div>

      <div className="flex justify-center mb-8">
        <div className="inline-flex p-1 bg-secondary/50 rounded-lg">
          <Button
            variant={billingPeriod === "monthly" ? "default" : "ghost"}
            size="sm"
            onClick={() => setBillingPeriod("monthly")}
            className="rounded-md"
          >
            Monthly
          </Button>
          <Button
            variant={billingPeriod === "yearly" ? "default" : "ghost"}
            size="sm"
            onClick={() => setBillingPeriod("yearly")}
            className="rounded-md"
          >
            Yearly
            <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-blue-600 text-white rounded-full">
              Save 20%
            </span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {pricingPlans.map((plan, index) => (
          <Card 
            key={plan.name}
            className={`border-white/10 ${
              plan.popular 
                ? "relative bg-gradient-to-b from-blue-900/20 to-indigo-900/20 shadow-glow" 
                : "bg-card"
            } animate-slide-up delay-${index + 1}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-0 right-0 flex justify-center">
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                  Most Popular
                </span>
              </div>
            )}
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <div className="flex items-baseline mt-2">
                <span className="text-3xl font-bold">
                  {billingPeriod === "yearly" 
                    ? `$${(parseFloat(plan.price.replace("$", "")) * 0.8 * 12).toFixed(2)}` 
                    : plan.price}
                </span>
                <span className="text-muted-foreground ml-1">
                  {billingPeriod === "yearly" ? "/year" : plan.period ? `/${plan.period}` : ""}
                </span>
              </div>
              <CardDescription className="mt-2">{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <Check size={18} className="mr-2 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className={`w-full ${
                  plan.popular 
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" 
                    : ""
                }`}
                variant={plan.popular ? "default" : "outline"}
              >
                {plan.buttonText}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Pricing;
