import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import EditorPage from "@/pages/EditorPage";
import PricingPage from "@/pages/PricingPage";
import AuthPage from "@/pages/AuthPage";
import AccountPage from "@/pages/AccountPage";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useEffect } from "react";

function TokenSynchronizer() {
  useEffect(() => {
    // Ensure token consistency - copy from authToken to token if needed
    const authToken = localStorage.getItem("authToken");
    const token = localStorage.getItem("token");

    if (authToken && !token) {
      console.log("Synchronizing tokens: copying from authToken to token");
      localStorage.setItem("token", authToken);
    } else if (token && !authToken) {
      console.log("Synchronizing tokens: copying from token to authToken");
      localStorage.setItem("authToken", token);
    }

    // Log final token state after synchronization
    console.log("Token state after sync: ", {
      token: localStorage.getItem("token") ? "exists" : "missing",
      authToken: localStorage.getItem("authToken") ? "exists" : "missing"
    });
  }, []);

  return null;
}

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/editor" component={EditorPage} />
          <Route path="/pricing" component={PricingPage} />
          <Route path="/auth" component={AuthPage} />
          <Route path="/account" component={AccountPage} />
          <Route component={NotFound} />
        </Switch>
      </div>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <TokenSynchronizer />
          <AuthProvider>
            <Router />
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
