import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route, useLocation } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // Check if user is within trial period (7 days from account creation)
  const shouldRedirectToMembership = () => {
    if (path === "/membership") return false; // Don't redirect if already on membership page
    
    // Admin users don't need to be redirected to membership
    if (user.isAdmin) return false;
    
    // For demo purposes only: HNO22 user is always considered within trial period
    if (user.username === "HNO22") return false;
    
    // Make sure createdAt exists before trying to use it
    if (!user.createdAt) return false;
    
    const createdAt = new Date(user.createdAt);
    const now = new Date();
    const differenceInDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    
    // Redirect if trial period (7 days) has ended
    return differenceInDays > 7;
  };

  if (shouldRedirectToMembership()) {
    return (
      <Route path={path}>
        <Redirect to="/membership" />
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}