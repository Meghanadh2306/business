import { useState, useEffect, useRef } from "react";

export default function Navbar({ setOpen, setAuth }) {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

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
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleLogout = () => {
    if (!window.confirm("Logout from your account?")) return;
    localStorage.removeItem("dairy_auth");
    setAuth(false);
  };

  return (
    <div style={styles.nav}>

      {/* MENU */}
      <button onClick={() => setOpen(prev => !prev)} style={styles.menuBtn}>
        ☰
      </button>

      {/* SEARCH */}
      <div style={styles.searchBox}>
        <span style={styles.searchIcon}>🔍</span>
        <input placeholder="Search..." style={styles.searchInput} />
      </div>

      {/* RIGHT SIDE */}
      <div style={styles.right}>
        {/* THEME */}
        <button style={styles.iconBtn} onClick={toggleTheme}>
          {theme === 'light' ? '🌙' : '☀️'}
        </button>

        {/* PROFILE */}
        <div style={styles.profileWrapper} ref={dropdownRef}>
          <div
            style={styles.userProfile}
            onClick={() => setShowDropdown(prev => !prev)}
          >
            <div style={styles.avatar}>SM</div>
          </div>

          {/* DROPDOWN */}
          <div
            style={{
              ...styles.dropdown,
              opacity: showDropdown ? 1 : 0,
              transform: showDropdown ? "translateY(0)" : "translateY(-10px)",
              pointerEvents: showDropdown ? "auto" : "none"
            }}
          >
            <div style={styles.dropdownHeader}>
              <div style={styles.avatarLarge}>SM</div>
              <div>
                <div style={styles.name}>Store Manager</div>
                <div style={styles.subText}>Active</div>
              </div>
            </div>

            <div style={styles.divider}></div>

            <div style={styles.logoutItem} onClick={handleLogout}>
              🚪 Logout
            </div>
          </div>
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