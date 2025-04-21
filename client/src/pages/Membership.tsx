import React from "react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Star, CheckCircle2, Calendar, Users, Shield, BookOpen, Video, Infinity, ArrowRight, AlertTriangle, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
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
  savings?: number;
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
    popular: true,
    savings: 180
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
  const { user } = useAuth();
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
                <h2 className="text-2xl font-heading font-bold mb-4">Transform with SoulSync</h2>
                <p className="text-neutral-600 max-w-2xl mx-auto">
                  Join our supportive community and unlock your true potential
                </p>
              </div>
              
              {/* Mindvalley-style pricing card */}
              <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                <div className="bg-indigo-900 text-white py-10 px-8">
                  <div className="flex flex-col md:flex-row justify-between items-center">
                    <div>
                      <h2 className="text-3xl font-bold mb-4">Transform Your Journey with SoulSync</h2>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <Check className="h-5 w-5 text-green-400 mr-3" />
                          <span>100+ Healing Rituals from Spiritual Experts</span>
                        </div>
                        <div className="flex items-center">
                          <Check className="h-5 w-5 text-green-400 mr-3" />
                          <span>Advanced AI Coaching for Personal Growth</span>
                        </div>
                        <div className="flex items-center">
                          <Check className="h-5 w-5 text-green-400 mr-3" />
                          <span>Exclusive Network: Connect with Like-minded Souls</span>
                        </div>
                        <div className="flex items-center">
                          <Check className="h-5 w-5 text-green-400 mr-3" />
                          <span>Premium Chakra Analysis & Balancing Tools</span>
                        </div>
                        <div className="flex items-center">
                          <Check className="h-5 w-5 text-green-400 mr-3" />
                          <span>100% Risk-Free: 14-day Money-back Guarantee</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex justify-center mb-8">
                    <Tabs 
                      defaultValue="year" 
                      value={billingInterval}
                      onValueChange={(value) => setBillingInterval(value as "month" | "year")}
                      className="w-full max-w-md"
                    >
                      <TabsList className="grid w-full grid-cols-2 p-1 bg-gray-100">
                        <TabsTrigger value="month" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Monthly</TabsTrigger>
                        <TabsTrigger value="year" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
                          <div className="flex flex-col items-center">
                            <span>Yearly</span>
                            {billingInterval === "year" && <span className="text-xs text-green-600 font-medium">Save $180/year</span>}
                          </div>
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                  
                  {pricingPlans
                    .filter(plan => plan.interval === billingInterval)
                    .map((plan) => (
                      <div key={plan.id} className="max-w-md mx-auto bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                        <div className="text-center mb-6">
                          <div className="text-5xl font-bold flex justify-center items-baseline">
                            <span className="text-2xl mr-1">$</span>{plan.price}
                            <span className="text-gray-500 text-lg font-normal ml-1">/{plan.interval}</span>
                          </div>
                          {plan.interval === "year" && (
                            <div className="text-sm text-gray-500 mt-1">Billed annually, cancel anytime</div>
                          )}
                        </div>
                        
                        <Button
                          onClick={() => handleSelectPlan(plan)}
                          className="w-full py-6 text-lg bg-[#FF5757] hover:bg-[#FF4040] rounded-xl mb-4"
                        >
                          Join SoulSync Membership
                        </Button>
                        
                        <div className="mt-4 flex justify-center space-x-3">
                          <svg className="h-8" viewBox="0 0 40 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="40" height="25" rx="4" fill="white"/>
                            <path fillRule="evenodd" clipRule="evenodd" d="M16.4822 7.92135H23.5194V17.1072H16.4822V7.92135Z" fill="#FF5F00"/>
                            <path fillRule="evenodd" clipRule="evenodd" d="M17.1803 12.5143C17.1791 10.9462 17.8769 9.45 19.0641 8.39241C17.3767 7.0324 15.0874 6.73354 13.1035 7.62489C11.1196 8.51625 9.89904 10.4514 9.90078 12.5799C9.90253 14.7084 11.1261 16.6416 13.1117 17.5299C15.0972 18.4181 17.3865 18.1157 19.0719 16.7539C17.8842 15.6957 17.1865 14.1983 17.1889 12.6299L17.1803 12.5143Z" fill="#EB001B"/>
                            <path fillRule="evenodd" clipRule="evenodd" d="M30.0996 12.5143C30.1014 14.6428 28.8808 16.578 26.8969 17.4693C24.913 18.3607 22.6237 18.0618 20.9363 16.7018C22.1234 15.6444 22.8213 14.1483 22.82 12.5803C22.8188 11.0123 22.1188 9.51658 20.9302 8.46063C22.6162 7.09925 24.9051 6.7992 26.8896 7.68966C28.8741 8.58012 30.0962 10.5153 30.0996 12.6443V12.5143Z" fill="#F79E1B"/>
                          </svg>
                          <svg className="h-8" viewBox="0 0 40 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="40" height="25" rx="4" fill="white"/>
                            <path d="M6 16.4262L7.88524 8.57377H10.9836L9.09836 16.4262H6Z" fill="#006FCF"/>
                            <path d="M18.6885 8.73771C18.0328 8.49181 17.0492 8.24591 15.9016 8.24591C13.0328 8.24591 11 9.80328 11 12.0984C11 13.8033 12.4262 14.7869 13.5246 15.3934C14.6721 16 15.0984 16.3934 15.0984 16.9508C15.0984 17.7541 14.1639 18.1311 13.2787 18.1311C12.0656 18.1311 11.3606 17.9344 10.2623 17.3934L9.88524 17.2295L9.5 19.7541C10.2787 20.082 11.689 20.3607 13.1475 20.3607C16.2131 20.3607 18.1967 18.8525 18.1967 16.3934C18.1967 15.0164 17.3443 13.9508 15.5738 13.0984C14.5 12.5738 13.8934 12.2131 13.8934 11.6557C13.8934 11.1639 14.4754 10.6721 15.6066 10.6721C16.5574 10.6393 17.2623 10.9016 17.8033 11.1639L18.0656 11.2951L18.6885 8.73771Z" fill="#006FCF"/>
                            <path d="M22.5246 8.57377H24.9508L27.9836 16.4262H25.1803L24.6885 14.9508H21.3607L20.9016 16.4262H18L22.5246 8.57377ZM23.9344 10.8688L22.5246 13.3934H24.1967L23.9344 10.8688Z" fill="#006FCF"/>
                            <path d="M29.4262 8.57377L32.2295 13.5574L33.0328 10.8032C33.0328 10.8032 33.2787 9.80328 33.3115 9.6721H36L32.8852 16.4262H30.0984L25.9508 8.57377H29.4262Z" fill="#006FCF"/>
                          </svg>
                          <svg className="h-8" viewBox="0 0 40 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="40" height="25" rx="4" fill="white"/>
                            <path d="M20 7C15.0294 7 11 10.8579 11 15.625C11 20.3921 15.0294 24.25 20 24.25C24.9706 24.25 29 20.3921 29 15.625C29 10.8579 24.9706 7 20 7Z" fill="#5F6368"/>
                            <path d="M20 18.2917C21.5062 18.2917 22.7245 17.118 22.7245 15.6667C22.7245 14.2153 21.5062 13.0417 20 13.0417C18.4938 13.0417 17.2755 14.2153 17.2755 15.6667C17.2755 17.118 18.4938 18.2917 20 18.2917Z" fill="white"/>
                          </svg>
                        </div>
                        
                        <div className="mt-3 text-xs text-center text-gray-500">
                          Powered by <span className="font-medium">stripe</span>
                        </div>
                        
                        <div className="mt-4 text-xs text-center text-gray-500">
                          VAT charges might apply as per your billing address
                        </div>
                        
                        <div className="mt-2 text-xs text-center text-gray-500 flex justify-center items-center">
                          <Shield className="h-3 w-3 inline-block mr-1" />
                          All transactions are secured with 256-bit encryption
                        </div>
                      </div>
                    ))}
                </div>
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
                        <span>Advanced chakra analysis</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <span>Personalized healing rituals</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <span>Priority AI coach guidance</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <div className="w-12 h-12 rounded-full bg-[#483D8B]/10 flex items-center justify-center mb-4">
                      <BookOpen className="h-6 w-6 text-[#483D8B]" />
                    </div>
                    <CardTitle>Curated Learning Resources</CardTitle>
                    <CardDescription>
                      Expand your knowledge with exclusive content
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <span>Member-only courses</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <span>Expert video workshops</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <span>Guided meditation library</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
            
            {/* Compare Plans Table */}
            <motion.div
              className="mb-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="text-center mb-10">
                <h2 className="text-2xl font-heading font-bold mb-4">Compare Plans</h2>
                <p className="text-neutral-600 max-w-2xl mx-auto">
                  See which features are available in the free and premium plans
                </p>
              </div>
              
              <div className="max-w-5xl mx-auto overflow-x-auto">
                <table className="w-full border-separate border-spacing-0">
                  <thead>
                    <tr>
                      <th className="bg-neutral-50 text-left py-4 px-6 font-medium text-neutral-500 rounded-tl-lg">Features</th>
                      <th className="bg-neutral-50 text-center py-4 px-6 font-medium text-neutral-500">Free</th>
                      <th className="bg-neutral-50 text-center py-4 px-6 font-medium text-neutral-500 rounded-tr-lg">Premium</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparePlansData.categories.map((category, categoryIndex) => (
                      <React.Fragment key={categoryIndex}>
                        <tr>
                          <td colSpan={3} className="py-3 px-6 font-medium text-[#483D8B]">
                            {category}
                          </td>
                        </tr>
                        {comparePlansData.features
                          .filter((_, idx) => Math.floor(idx / 4) === categoryIndex)
                          .map((feature, idx) => (
                            <tr key={idx} className="border-b border-neutral-100 last:border-0">
                              <td className="py-3 px-6">{feature.name}</td>
                              <td className="py-3 px-6 text-center">
                                {feature.free === true ? (
                                  <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                                ) : feature.free === false ? (
                                  <span className="text-neutral-300">—</span>
                                ) : (
                                  <span className="text-sm text-neutral-500">{feature.free}</span>
                                )}
                              </td>
                              <td className="py-3 px-6 text-center">
                                {feature.paid === true ? (
                                  <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                                ) : (
                                  <span className="text-sm text-neutral-500">{feature.paid}</span>
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
                <h2 className="text-2xl font-heading font-bold mb-4">Member Testimonials</h2>
                <p className="text-neutral-600 max-w-2xl mx-auto">
                  Hear from our community about their transformative experiences
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {testimonials.map((testimonial) => (
                  <Card key={testimonial.id} className="bg-white border border-neutral-100">
                    <CardContent className="pt-6">
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 rounded-full bg-[#483D8B]/10 flex items-center justify-center text-[#483D8B] font-medium mr-3">
                          {testimonial.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium">{testimonial.name}</div>
                          <div className="text-xs text-neutral-500">Member</div>
                        </div>
                      </div>
                      <p className="text-neutral-600 text-sm">"{testimonial.content}"</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
            
            {/* FAQ Section */}
            <motion.div
              className="mb-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="text-center mb-10">
                <h2 className="text-2xl font-heading font-bold mb-4">Frequently Asked Questions</h2>
                <p className="text-neutral-600 max-w-2xl mx-auto">
                  Find answers to common questions about SoulSync membership
                </p>
              </div>
              
              <div className="max-w-3xl mx-auto">
                {faqData.map((faq, index) => (
                  <Card key={index} className="mb-4 border border-neutral-100">
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
            
            {/* CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="text-center max-w-3xl mx-auto bg-gradient-to-r from-[#483D8B]/10 to-[#008080]/10 p-10 rounded-2xl"
            >
              <h2 className="text-3xl font-heading font-bold mb-4">
                Ready to Transform Your Journey?
              </h2>
              <p className="text-neutral-600 mb-8 max-w-xl mx-auto">
                Join our community today and unlock your full spiritual potential with personalized guidance and premium tools.
              </p>
              <Button
                className="bg-[#483D8B] hover:bg-opacity-90 text-lg px-8 py-6 h-auto"
                onClick={() => handleSelectPlan(pricingPlans[1])}
              >
                Start Your Membership
              </Button>
              <div className="text-sm text-neutral-500 mt-4">
                14-day money-back guarantee, cancel anytime
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}