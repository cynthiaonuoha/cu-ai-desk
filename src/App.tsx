
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import ChatbotPage from "./pages/ChatbotPage";
import SummarizeNotesPage from "./pages/SummarizeNotesPage";
import TodoPage from "./pages/TodoPage";
import RemindersPage from "./pages/RemindersPage";
import StudyTipsPage from "./pages/StudyTipsPage";
import HealthTipsPage from "./pages/HealthTipsPage";
import CalculatorPage from "./pages/CalculatorPage";
import SettingsPage from "./pages/SettingsPage";
import SocialPage from "./pages/SocialPage";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import AboutPage from "./pages/AboutPage";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/chatbot" 
              element={
                <ProtectedRoute>
                  <ChatbotPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/summarize" 
              element={
                <ProtectedRoute>
                  <SummarizeNotesPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/todo" 
              element={
                <ProtectedRoute>
                  <TodoPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/reminders" 
              element={
                <ProtectedRoute>
                  <RemindersPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/study-tips" 
              element={
                <ProtectedRoute>
                  <StudyTipsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/health-tips" 
              element={
                <ProtectedRoute>
                  <HealthTipsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/calculator" 
              element={
                <ProtectedRoute>
                  <CalculatorPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/social" 
              element={
                <ProtectedRoute>
                  <SocialPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/about" 
              element={
                <ProtectedRoute>
                  <AboutPage />
                </ProtectedRoute>
              } 
            />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
