import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/layout/Layout";

import Dashboard from "../pages/dashboard/Dashboard";
import CreateBill from "../pages/bills/CreateBill";
import BillsList from "../pages/bills/BillsList";
import Customers from "../pages/customers/Customers";
import CustomerDetails from "../pages/customers/CustomerDetails";
import Products from "../pages/products/Products";
import Reports from "../pages/reports/Reports";
import Login from "../pages/auth/Login";

// 🔐 Protected Route
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null; // cleaner than loader flicker

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// 🔓 Public Route
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function AppRoutes() {
  return (
    <Routes>

      {/* LOGIN */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* PROTECTED */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/create" element={<CreateBill />} />
        <Route path="/bills" element={<BillsList />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/customers/:id" element={<CustomerDetails />} />
        <Route path="/products" element={<Products />} />
        <Route path="/reports" element={<Reports />} />
      </Route>

      {/* FALLBACK (SMART FIX) */}
      <Route path="*" element={<Navigate to="/login" replace />} />

    </Routes>
  );
}