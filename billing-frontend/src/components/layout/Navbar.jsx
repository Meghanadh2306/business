import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Navbar({ setOpen }) {
  const { logout, username } = useAuth();
  const navigate = useNavigate();
  const isVijaya = username === "vijaya";
  const userInitials = isVijaya ? "VI" : "OM";
  const userDisplayName = isVijaya ? "Vijaya Dairy" : "Omkar Sai";

  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef();

  // 🌙 THEME
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  // 🔽 CLOSE DROPDOWN ON OUTSIDE CLICK
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // 🚪 LOGOUT (IMPROVED)
  const handleLogout = () => {
    if (!window.confirm("Are you sure you want to logout?")) return;

    setShowDropdown(false); // ✅ close dropdown
    logout(); // ✅ context logout
  };

  return (
    <div
      style={{
        padding: "10px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        borderBottom: "1px solid var(--border-color)",
        background: "var(--bg-card)",
      }}
    >
      {/* MENU */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        style={{
          fontSize: "20px",
          border: "none",
          background: "transparent",
          cursor: "pointer",
        }}
      >
        ☰
      </button>

      {/* SEARCH */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          background: "var(--bg-color)",
          borderRadius: "20px",
          padding: "6px 10px",
          border: "1px solid var(--border-color)",
        }}
      >
        <span style={{ marginRight: "6px", opacity: 0.6 }}>🔍</span>
        <input
          placeholder="Search..."
          style={{
            border: "none",
            outline: "none",
            background: "transparent",
            width: "100%",
            fontSize: "14px",
          }}
        />
      </div>

      {/* RIGHT */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>

        {/* THEME */}
        <button
          onClick={toggleTheme}
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "50%",
            border: "none",
            cursor: "pointer",
            background: "var(--bg-color)",
          }}
        >
          {theme === "light" ? "🌙" : "☀️"}
        </button>

        {/* PROFILE */}
        <div style={{ position: "relative" }} ref={dropdownRef}>
          <div
            onClick={() => setShowDropdown((prev) => !prev)}
            style={{ cursor: "pointer" }}
          >
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "600",
                fontSize: "13px",
              }}
            >
              {userInitials}
            </div>
          </div>

          {/* DROPDOWN */}
          {showDropdown && (
            <div
              style={{
                position: "absolute",
                top: "44px",
                right: 0,
                width: "200px",
                background: "var(--bg-card)",
                borderRadius: "12px",
                boxShadow: "0 12px 30px rgba(0,0,0,0.15)",
                zIndex: 999,
                overflow: "hidden",
              }}
            >
              <div style={{ padding: "12px", textAlign: "center" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: "#6366f1",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 8px",
                    fontWeight: "600",
                  }}
                >
                  {userInitials}
                </div>

                <div style={{ fontSize: "14px", fontWeight: "600" }}>
                  {userDisplayName}
                </div>
                <div style={{ fontSize: "12px", opacity: 0.6 }}>
                  Store Manager
                </div>
              </div>

              <div
                style={{
                  height: "1px",
                  background: "var(--border-color)",
                }}
              />

              {/* CHANGE PASSWORD */}
              <div
                onClick={() => {
                  setShowDropdown(false);
                  navigate("/change-password");
                }}
                style={{
                  padding: "12px",
                  cursor: "pointer",
                  fontSize: "14px",
                  color: "var(--text-main)",
                  fontWeight: "500",
                  textAlign: "center",
                }}
              >
                🔐 Change Password
              </div>

              <div
                style={{
                  height: "1px",
                  background: "var(--border-color)",
                }}
              />

              {/* LOGOUT */}
              <div
                onClick={handleLogout}
                style={{
                  padding: "12px",
                  cursor: "pointer",
                  fontSize: "14px",
                  color: "#ef4444",
                  fontWeight: "500",
                  textAlign: "center",
                }}
              >
                🚪 Logout
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  nav: {
    padding: "10px 12px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    borderBottom: "1px solid var(--border-color)",
    background: "var(--bg-card)",
  },

  menuBtn: {
    fontSize: "20px",
    background: "none",
    border: "none",
    cursor: "pointer"
  },

  searchBox: {
    display: "flex",
    alignItems: "center",
    background: "var(--bg-color)",
    borderRadius: "20px",
    padding: "6px 10px",
    border: "1px solid var(--border-color)",
    flex: 1,
    minWidth: 0
  },

  searchIcon: {
    marginRight: "6px",
    opacity: 0.6
  },

  searchInput: {
    border: "none",
    outline: "none",
    background: "transparent",
    width: "100%",
    fontSize: "14px",
    color: "var(--text-main)"
  },

  right: {
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },

  iconBtn: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
    background: "var(--bg-color)"
  },

  profileWrapper: {
    position: "relative"
  },

  userProfile: {
    cursor: "pointer"
  },

  avatar: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "600",
    fontSize: "13px"
  },

  dropdown: {
    position: "absolute",
    top: "44px",
    right: 0,
    width: "200px",
    background: "var(--bg-card)",
    borderRadius: "12px",
    boxShadow: "0 12px 30px rgba(0,0,0,0.15)",
    transition: "all 0.2s ease",
    overflow: "hidden",
    zIndex: 999
  },

  dropdownHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px"
  },

  avatarLarge: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "#6366f1",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "600"
  },

  name: {
    fontSize: "14px",
    fontWeight: "600"
  },

  subText: {
    fontSize: "12px",
    opacity: 0.6
  },

  divider: {
    height: "1px",
    background: "var(--border-color)",
    margin: "6px 0"
  },

  logoutItem: {
    padding: "12px",
    cursor: "pointer",
    fontSize: "14px",
    color: "#ef4444",
    fontWeight: "500",
    textAlign: "center"
  }
};