import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CustomerDashboard from "./pages/CustomerDashboard";
import ProviderDashboard from "./pages/ProviderDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import "./App.css";

function AppContent() {
  const { user } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  if (!user) {
    if (showRegister) {
      return (
        <div className="page-wrapper">
          <RegisterPage />
          <p className="auth-toggle">
            Already have an account?
            <button onClick={() => setShowRegister(false)}>Login</button>
          </p>
        </div>
      );
    }
    return (
      <div className="page-wrapper">
        <LoginPage />
        <p className="auth-toggle">
          New here?
          <button onClick={() => setShowRegister(true)}>Register</button>
        </p>
      </div>
    );
  }

  if (user.role === "customer") return <CustomerDashboard />;
  if (user.role === "provider") return <ProviderDashboard />;
  if (user.role === "admin") return <AdminDashboard />;

  return <LoginPage />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;