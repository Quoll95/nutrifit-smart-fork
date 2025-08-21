import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Diary from "./pages/Diary";
import AddFood from "./pages/AddFood";
import Devices from "./pages/Devices";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Mock Auth Provider for testing
const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const mockAuthContext = {
    user: { id: 'test-user', email: 'test@example.com' } as any,
    session: null,
    loading: false,
    signUp: async () => ({ error: null }),
    signIn: async () => ({ error: null }),
    signOut: async () => ({ error: null }),
  };

  return React.createElement('div', { 'data-mock-auth': true }, children);
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {/* Using Mock Auth Provider for testing - Real AuthProvider will be re-enabled later */}
      <MockAuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* <Route path="/auth" element={<Auth />} /> */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="diary" element={<Diary />} />
              <Route path="add" element={<AddFood />} />
              <Route path="devices" element={<Devices />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </MockAuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
