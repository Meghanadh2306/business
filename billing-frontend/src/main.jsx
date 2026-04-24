import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/global.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext"; // ✅ ADD THIS

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider> {/* ✅ WRAP APP */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);