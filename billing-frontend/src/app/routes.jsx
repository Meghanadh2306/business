import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../components/layout/Layout";

// Pages
import Dashboard from "../pages/dashboard/Dashboard";
import CreateBill from "../pages/bills/CreateBill";
import BillsList from "../pages/bills/BillsList";
import Customers from "../pages/customers/Customers";
import CustomerDetails from "../pages/customers/CustomerDetails";
import Products from "../pages/products/Products";
import Reports from "../pages/reports/Reports";
import Login from "../pages/auth/Login";

export default function AppRoutes() {
  const [auth, setAuth] = useState(!!localStorage.getItem("dairy_auth"));

  return (
    <Routes>
      {!auth ? (
        <Route path="*" element={<Login setAuth={setAuth} />} />
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