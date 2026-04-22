import { useState, useEffect } from "react";

export default function Navbar({ setOpen, setAuth }) {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };
  const handleLogout = () => {
    localStorage.removeItem("dairy_auth");
    setAuth(false);
  };

  return (
    <div style={styles.nav} className="glass">

      <div style={styles.left}>
        <button onClick={() => setOpen(prev => !prev)} style={styles.menuBtn}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <div style={styles.searchBox}>
          <span style={{ color: "var(--text-muted)", marginLeft: "10px" }}>🔍</span>
          <input type="text" placeholder="Search..." style={styles.searchInput} />
        </div>
      </div>

      <div style={styles.right}>
        <button style={styles.iconBtn} onClick={toggleTheme} title="Toggle Theme">
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        <button style={styles.iconBtn} onClick={handleLogout} title="Logout">🚪</button>
        <div style={styles.userProfile}>
          <div style={styles.avatar}>A</div>
          <div style={styles.userInfo}>
            <span style={styles.userName}>Admin</span>
            <span style={styles.userRole}>Store Manager</span>
          </div>
        </div>
      </div>
    </div>
  );
}
const styles = {
  nav: {
    padding: "12px 16px", // reduced for mobile
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "sticky",
    top: 0,
    zIndex: 100,
    borderBottom: "1px solid var(--border-color)",
    background: "var(--bg-card)",
    flexWrap: "wrap", // ✅ important
    gap: "10px"
  },
  left: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flex: 1
  },
  menuBtn: {
    background: "none",
    border: "none",
    color: "var(--text-main)",
    padding: "6px",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    background: "var(--bg-color)",
    borderRadius: "20px",
    padding: "4px",
    width: "100%", // ✅ responsive
    maxWidth: "200px", // limit size
    border: "1px solid var(--border-color)"
  },
  searchInput: {
    border: "none",
    background: "transparent",
    width: "100%",
    padding: "6px",
    fontSize: "14px"
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },
  iconBtn: {
    width: "36px",
    height: "36px",
    fontSize: "16px",
  },
  userProfile: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  avatar: {
    width: "32px",
    height: "32px",
    fontSize: "14px"
  },
  userInfo: {
    display: window.innerWidth < 768 ? "none" : "flex", // ✅ hide on mobile
    flexDirection: "column"
  }
};