import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PublicRoute from './components/auth/PublicRoute';
import AdminRoute from "./components/auth/AdminRoute";

// Pages imports
import HomePage from "./pages/HomePage";
import FAQsPage from "./pages/FAQsPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import UserCabinet from "./pages/UserCabinet";
import SingleProductPage from "./pages/SingleProductPage";
import AdminPanel from "./pages/AdminPanel";
import AdminLoginPage from "./pages/AdminLoginPage";

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Router>
          <div className="app">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/faqs" element={<FAQsPage />} />
              <Route path="/product/:id" element={<SingleProductPage/>} />
              <Route 
                  path="/adminlogin" 
                  element={
                    <PublicRoute>
                      <AdminLoginPage />
                    </PublicRoute>
                  } 
                />
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/signup" 
                element={
                  <PublicRoute>
                    <SignUpPage />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/cabinet" 
                element={
                  <ProtectedRoute>
                    <UserCabinet />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <AdminRoute>
                    <AdminPanel />
                  </AdminRoute>
                } 
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;