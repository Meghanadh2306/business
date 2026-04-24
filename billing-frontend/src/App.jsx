import { useEffect, useCallback } from "react";
import AppRoutes from "./app/routes.jsx";
import useAutoLogout from "./hooks/useAutoLogout";

export default function App() {

  // 🔐 LOGOUT FUNCTION
  const logout = useCallback(() => {
    const token = sessionStorage.getItem("token");

    if (!token) return;

    sessionStorage.removeItem("token");

    if (window.location.pathname !== "/") {
      window.location.href = "/";
    }
  }, []);

  // ⏱ AUTO LOGOUT (10 min idle)
  useAutoLogout(logout, 10 * 60 * 1000);

  // 🔄 Check last activity (after reopen)
  useEffect(() => {
    const lastActivity = sessionStorage.getItem("lastActivity");

    if (lastActivity) {
      const diff = Date.now() - Number(lastActivity);

      if (diff > 10 * 60 * 1000) {
        logout();
      }
    }
  }, [logout]);

  // 🚀 Wake up backend (Render cold start fix)
  useEffect(() => {
    fetch("https://billing-backend-5lkf.onrender.com")
      .catch(() => { });
  }, []);

  return <AppRoutes />;
}