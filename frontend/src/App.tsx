import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import RegistrationPage from "./pages/Registration";
import HomePage from "./pages/HomePage";
import ForgotPasswordPage from "./pages/ForgotPassword";
import ServiceProviderDashboard from "./pages/Dashboard";
import ServiceProviderDetails from "./pages/Details";
import "./App.css";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/dashboard" element={<ServiceProviderDashboard />} />
          <Route path="/provider/:id" element={<ServiceProviderDetails />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
