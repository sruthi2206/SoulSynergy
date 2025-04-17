import React from "react";
import { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Star, CheckCircle2, Calendar, Users, Shield, BookOpen, Video, Infinity, ArrowRight, AlertTriangle, Loader2 } from "lucide-react";
import { UserContext } from "@/App";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// Check if Stripe public key is available
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : null;

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  interval: "month" | "year";
  features: string[];
  popular?: boolean;
}

// Pricing plans
const pricingPlans: PricingPlan[] = [
  {
    id: "monthly",
    name: "Monthly",
    price: 25,
    interval: "month",
    features: [
      "Full access to all healing rituals",
      "Exclusive community content",
      "Member-only events",
      "Premium AI coaching sessions",
      "Advanced chakra analysis",
      "Specialized meditation guides"
    ]
  },
  {
    id: "yearly",
    name: "Yearly",
    price: 120,
    interval: "year",
    features: [
      "All Monthly plan features",
      "Save $180 compared to monthly",
      "Priority access to new features",
      "Personal healing path consultation",
      "VIP access to premium workshops",
      "Extended support for your journey"
    ],
    popular: true
  }
];

// Compare plans table data
const comparePlansData = {
  categories: ["Community Features", "Healing Tools", "Personal Growth", "Learning Resources"],
  features: [
    { name: "Community Forums", free: true, paid: true },
    { name: "Direct Messaging", free: false, paid: true },
    { name: "Group Events", free: "Limited", paid: true },
    { name: "Exclusive Workshops", free: false, paid: true },
    { name: "Basic Chakra Assessment", free: true, paid: true },
    { name: "Advanced Chakra Analysis", free: false, paid: true },
    { name: "Personalized Healing Rituals", free: "Limited", paid: true },
    { name: "Custom Meditation Guides", free: false, paid: true },
    { name: "AI Coaching Sessions", free: "2/month", paid: "Unlimited" },
    { name: "Progress Tracking", free: "Basic", paid: "Advanced" },
    { name: "Shadow Work Tools", free: false, paid: true },
    { name: "Inner Child Healing", free: false, paid: true },
    { name: "Educational Articles", free: "Limited", paid: true },
    { name: "Video Courses", free: false, paid: true },
    { name: "Guided Practices Library", free: false, paid: true },
    { name: "Expert Interviews", free: false, paid: true }
  ]
};

// FAQ data
const faqData = [
  {
    question: "Can I cancel my subscription at any time?",
    answer: "Yes, you can cancel your subscription at any time. Your benefits will continue until the end of your current billing period."
  },
  {
    question: "What happens after I subscribe?",
    answer: "After subscribing, you'll get immediate access to all premium features. You'll receive a welcome email with instructions on how to access all the member resources."
  },
  {
    question: "Is there a free trial available?",
    answer: "We don't currently offer a free trial, but we do have a 14-day money-back guarantee if you're not satisfied with your membership."
  },
  {
    question: "Can I switch between monthly and yearly plans?",
    answer: "Yes, you can switch from monthly to yearly (or vice versa) at any time. If you upgrade to yearly, you'll be charged the new rate immediately. If you switch to monthly, the change will take effect at your next billing cycle."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit and debit cards, including Visa, Mastercard, American Express, and Discover."
  },
  {
    question: "How do I access the premium content after subscribing?",
    answer: "All premium content will be automatically unlocked throughout the platform immediately after your subscription is processed."
  }
];

// Testimonials data
const testimonials = [
  {
    id: 1,
    name: "Sarah J.",
    content: "Since joining SoulSync, my spiritual practice has deepened in ways I never imagined. The community support and premium tools have been worth every penny!",
    avatar: ""
  },
  {
    id: 2,
    name: "Michael T.",
    content: "I was skeptical about paying for a spiritual platform, but the AI coaching alone has given me more insights than years of searching. The yearly plan is a no-brainer.",
    avatar: ""
  },
  {
    id: 3,
    name: "Emma R.",
    content: "The specialized healing rituals and member workshops have transformed my approach to shadow work. This community has become essential to my daily practice.",
    avatar: ""
  }
];

// Payment Components
const CheckoutForm = ({ plan }: { plan: PricingPlan }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }
    
    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + "/dashboard",
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message || "An error occurred during payment processing.",
          variant: "destructive",
        });
      } else {
        // Payment succeeded
        toast({
          title: "Payment Successful",
          description: "Thank you for your subscription!",
        });
        setLocation("/dashboard");
      }
    } catch (err) {
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Payment Information</h3>
        <PaymentElement />
      </div>
      
      <div className="p-4 bg-neutral-50 rounded-lg">
        <div className="flex justify-between mb-2">
          <span>Plan</span>
          <span className="font-medium">{plan.name}</span>
        </div>
        <div className="flex justify-between mb-4">
          <span>Total</span>
          <span className="font-medium">${plan.price}.00</span>
        </div>
        <div className="text-xs text-neutral-500">
          You'll be charged ${plan.price}.00 {plan.interval === "month" ? "every month" : "annually"}. You can cancel anytime.
        </div>
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-[#483D8B] hover:bg-opacity-90"
        disabled={!stripe || !elements || isProcessing}
      >
        {isProcessing ? "Processing..." : `Subscribe - $${plan.price}/${plan.interval === "month" ? "mo" : "year"}`}
      </Button>
    </form>
  );
};

const CheckoutContainer = ({ plan }: { plan: PricingPlan }) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const { toast } = useToast();
  
  const createPaymentIntentMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/create-payment-intent", { 
        amount: plan.price,
        interval: plan.interval
      });
      return response.json();
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Create payment intent when component mounts
  useEffect(() => {
    createPaymentIntentMutation.mutate();
  }, []);
  
  if (!clientSecret && createPaymentIntentMutation.isPending) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-[#483D8B] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!clientSecret && createPaymentIntentMutation.isError) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500 mb-4">Failed to initialize payment</p>
        <Button onClick={() => createPaymentIntentMutation.mutate()}>Try Again</Button>
      </div>
    );
  }
  
  return (
    <div>
      {clientSecret && stripePromise && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm plan={plan} />
        </Elements>
      )}
    </div>
  );
};

// Payment processing unavailable message
const PaymentUnavailableMessage = () => {
  return (
    <div className="p-8 text-center">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="h-12 w-12 text-yellow-500" />
        </div>
        <h3 className="text-xl font-medium text-yellow-800 mb-3">Payment Processing Currently Unavailable</h3>
        <p className="text-yellow-700 mb-4">
          Our payment system is currently being updated. Please check back later to subscribe to our premium plans.
        </p>
        <p className="text-sm text-yellow-600">
          We apologize for the inconvenience and are working to restore payment functionality as soon as possible.
        </p>
      </div>
      <Button 
        variant="outline" 
        onClick={() => window.location.href = "/dashboard"}
        className="mt-4"
      >
        Return to Dashboard
      </Button>
    </div>
  );
};

export default function Membership() {
  const [billingInterval, setBillingInterval] = useState<"month" | "year">("year");
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const { user } = useContext(UserContext);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const handleSelectPlan = (plan: PricingPlan) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please sign in to subscribe to a membership plan.",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedPlan(plan);
    setShowCheckout(true);
  };
  
  return (
    <div className="min-h-screen bg-neutral-50 pt-20 pb-16">
      <div className="container mx-auto px-4">
        {showCheckout ? (
          <div className="max-w-md mx-auto">
            <Button 
              variant="ghost" 
              onClick={() => setShowCheckout(false)} 
              className="mb-6"
            >
              <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
              Back to Plans
            </Button>
            {selectedPlan && stripePromise ? (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Complete Your Purchase</CardTitle>
                  <CardDescription>
                    You're subscribing to the {selectedPlan.name} plan at ${selectedPlan.price}/{selectedPlan.interval}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CheckoutContainer plan={selectedPlan} />
                </CardContent>
              </Card>
            ) : (
              <PaymentUnavailableMessage />
            )}
          </div>
        ) : (
          <>
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl font-heading font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#483D8B] to-[#008080]">
                Elevate Your Healing Journey
              </h1>
              <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
                Unlock premium features, personalized guidance, and exclusive community access
              </p>
            </motion.div>
            
            {/* Pricing Plans */}
            <motion.div
              className="mb-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-heading font-bold mb-4">Choose Your Membership Plan</h2>
                <p className="text-neutral-600 max-w-2xl mx-auto">
                  Select the plan that best fits your healing journey and unlock the full potential of SoulSync
                </p>
                
                <div className="flex justify-center mt-6">
                  <Tabs 
                    defaultValue="year" 
                    value={billingInterval}
                    onValueChange={(value) => setBillingInterval(value as "month" | "year")}
                    className="w-full max-w-xs"
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="month">Monthly</TabsTrigger>
                      <TabsTrigger value="year">Yearly</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {pricingPlans
                  .filter(plan => plan.interval === billingInterval)
                  .map((plan) => (
                    <Card 
                      key={plan.id}
                      className={`border-2 ${plan.popular ? "border-[#483D8B]" : "border-neutral-200"} relative`}
                    >
                      {plan.popular && (
                        <div className="absolute top-0 right-0 bg-[#483D8B] text-white py-1 px-3 text-xs uppercase font-bold rounded-bl-lg">
                          Best Value
                        </div>
                      )}
                      <CardHeader>
                        <CardTitle className="text-2xl">{plan.name}</CardTitle>
                        <CardDescription>
                          {plan.interval === "month" ? "Flexible monthly subscription" : "Save $180 with annual billing"}
                        </CardDescription>
                        <div className="mt-4">
                          <span className="text-4xl font-bold">${plan.price}</span>
                          <span className="text-neutral-500">/{plan.interval}</span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {plan.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start">
                              <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          className={`w-full ${plan.popular ? "bg-[#483D8B] hover:bg-opacity-90" : "bg-neutral-800 hover:bg-neutral-700"}`}
                          onClick={() => handleSelectPlan(plan)}
                        >
                          {user ? "Subscribe Now" : "Sign Up"}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
              
              <div className="text-center mt-6 text-neutral-500 text-sm">
                All plans include our 14-day money-back guarantee
              </div>
            </motion.div>
            
            {/* Membership Benefits */}
            <motion.div
              className="mb-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="text-center mb-10">
                <h2 className="text-2xl font-heading font-bold mb-4">Membership Benefits</h2>
                <p className="text-neutral-600 max-w-2xl mx-auto">
                  Transform your spiritual practice with premium features and exclusive content
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card>
                  <CardHeader>
                    <div className="w-12 h-12 rounded-full bg-[#483D8B]/10 flex items-center justify-center mb-4">
                      <Users className="h-6 w-6 text-[#483D8B]" />
                    </div>
                    <CardTitle>Exclusive Community</CardTitle>
                    <CardDescription>
                      Connect with fellow seekers on the same path
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <span>Private discussion groups</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <span>Direct messaging with members</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <span>Expert-led community events</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <div className="w-12 h-12 rounded-full bg-[#483D8B]/10 flex items-center justify-center mb-4">
                      <Star className="h-6 w-6 text-[#483D8B]" />
                    </div>
                    <CardTitle>Premium Healing Tools</CardTitle>
                    <CardDescription>
                      Access advanced healing practices and tools
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <span>Advanced chakra visualization</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <span>Personalized healing rituals</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <span>Custom meditation guides</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <div className="w-12 h-12 rounded-full bg-[#483D8B]/10 flex items-center justify-center mb-4">
                      <Infinity className="h-6 w-6 text-[#483D8B]" />
                    </div>
                    <CardTitle>Unlimited Access</CardTitle>
                    <CardDescription>
                      No limits to the tools and resources you can use
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <span>Unlimited AI coaching conversations</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <span>Full healing ritual library</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <span>Unrestricted progress tracking</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
            
            {/* Compare Plans */}
            <motion.div
              className="mb-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="text-center mb-10">
                <h2 className="text-2xl font-heading font-bold mb-4">Compare Membership Tiers</h2>
                <p className="text-neutral-600 max-w-2xl mx-auto">
                  See the difference between our free features and premium membership benefits
                </p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-neutral-100">
                      <th className="px-6 py-4 text-left text-sm font-medium text-neutral-600">Features</th>
                      <th className="px-6 py-4 text-center text-sm font-medium text-neutral-600">Free</th>
                      <th className="px-6 py-4 text-center text-sm font-medium text-[#483D8B]">Premium</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {comparePlansData.categories.map((category, idx) => (
                      <React.Fragment key={idx}>
                        <tr className="bg-neutral-50">
                          <td colSpan={3} className="px-6 py-3 text-sm font-semibold text-neutral-700">{category}</td>
                        </tr>
                        {comparePlansData.features
                          .filter((_, featureIdx) => Math.floor(featureIdx / 4) === idx)
                          .map((feature, featureIdx) => (
                            <tr key={`${idx}-${featureIdx}`} className="hover:bg-neutral-50">
                              <td className="px-6 py-3 text-sm text-neutral-800">{feature.name}</td>
                              <td className="px-6 py-3 text-center text-sm">
                                {feature.free === true ? (
                                  <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                                ) : feature.free === false ? (
                                  <span className="text-neutral-400">—</span>
                                ) : (
                                  <span className="text-neutral-500 text-xs px-2 py-1 bg-neutral-100 rounded-full">{feature.free}</span>
                                )}
                              </td>
                              <td className="px-6 py-3 text-center text-sm">
                                {feature.paid === true ? (
                                  <CheckCircle2 className="h-5 w-5 text-[#483D8B] mx-auto" />
                                ) : (
                                  <span className="text-[#483D8B] text-xs px-2 py-1 bg-[#483D8B]/10 rounded-full">{feature.paid}</span>
                                )}
                              </td>
                            </tr>
                          ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
            
            {/* Testimonials */}
            <motion.div
              className="mb-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="text-center mb-10">
                <h2 className="text-2xl font-heading font-bold mb-4">What Our Members Say</h2>
                <p className="text-neutral-600 max-w-2xl mx-auto">
                  Hear from people who have transformed their spiritual practice with SoulSync premium
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {testimonials.map((testimonial) => (
                  <Card key={testimonial.id}>
                    <CardContent className="pt-6">
                      <div className="mb-4 flex justify-center">
                        <div className="w-12 h-12 rounded-full bg-[#483D8B]/10 flex items-center justify-center">
                          {testimonial.avatar ? (
                            <img 
                              src={testimonial.avatar} 
                              alt={testimonial.name} 
                              className="w-full h-full rounded-full" 
                            />
                          ) : (
                            <span className="text-[#483D8B] font-semibold text-lg">
                              {testimonial.name.charAt(0)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-center mb-4">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-[#483D8B] text-[#483D8B]" />
                          ))}
                        </div>
                      </div>
                      <p className="text-neutral-700 text-center mb-4 italic">"{testimonial.content}"</p>
                      <p className="text-neutral-500 text-sm text-center font-medium">{testimonial.name}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
            
            {/* FAQs */}
            <motion.div
              className="mb-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="text-center mb-10">
                <h2 className="text-2xl font-heading font-bold mb-4">Frequently Asked Questions</h2>
                <p className="text-neutral-600 max-w-2xl mx-auto">
                  Find answers to common questions about our membership plans
                </p>
              </div>
              
              <div className="max-w-3xl mx-auto">
                {faqData.map((faq, idx) => (
                  <Card key={idx} className="mb-4">
                    <CardHeader>
                      <CardTitle className="text-lg">{faq.question}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-neutral-600">{faq.answer}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
            
            {/* CTA */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <div className="bg-gradient-to-r from-[#483D8B]/10 to-[#008080]/10 p-10 rounded-lg max-w-4xl mx-auto">
                <h2 className="text-3xl font-heading font-bold mb-4">Ready to Transform Your Healing Journey?</h2>
                <p className="text-neutral-600 max-w-2xl mx-auto mb-8">
                  Join thousands of seekers who have elevated their practice with SoulSync premium membership
                </p>
                <Button 
                  size="lg"
                  className="bg-[#483D8B] hover:bg-opacity-90 px-8"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  Choose Your Plan
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}