import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../components/layout/Layout";

import Dashboard from "../pages/dashboard/Dashboard";
import CreateBill from "../pages/bills/CreateBill";
import BillsList from "../pages/bills/BillsList";
import Customers from "../pages/customers/Customers";
import CustomerDetails from "../pages/customers/CustomerDetails";
import Products from "../pages/products/Products";
import Reports from "../pages/reports/Reports";
import Login from "../pages/auth/Login";

export default function AppRoutes() {
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("dairy_auth");
    setAuth(!!stored);
  }, []);

  if (auth === null) {
    return <div style={{ textAlign: "center", padding: "20px" }}>Loading...</div>;
  }

  return (
    <Routes>
      {!auth ? (
        <>
          <Route path="/login" element={<Login setAuth={setAuth} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      ) : (
        <Route element={<Layout setAuth={setAuth} />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/create" element={<CreateBill />} />
          <Route path="/bills" element={<BillsList />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/:id" element={<CustomerDetails />} />
          <Route path="/products" element={<Products />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      )}
    </Routes>
  );
}