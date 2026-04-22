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
    padding: "16px 32px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "sticky",
    top: 0,
    zIndex: 100,
    borderBottom: "1px solid var(--border-color)",
    background: "var(--bg-card)",
  },
  left: {
    display: "flex",
    alignItems: "center",
    gap: "24px"
  },
  menuBtn: {
    background: "none",
    border: "none",
    color: "var(--text-main)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px",
    borderRadius: "8px",
    transition: "background 0.2s",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    background: "var(--bg-color)",
    borderRadius: "20px",
    padding: "4px",
    width: "250px",
    border: "1px solid var(--border-color)"
  },
  searchInput: {
    border: "none",
    background: "transparent",
    boxShadow: "none",
    width: "100%",
    padding: "6px 12px",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: "20px"
  },
  iconBtn: {
    background: "var(--bg-color)",
    border: "1px solid var(--border-color)",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
  },
  userProfile: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer"
  },
  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "var(--primary)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: "16px"
  },
  userInfo: {
    display: "flex",
    flexDirection: "column"
  },
  userName: {
    fontWeight: 600,
    fontSize: "14px"
  },
  userRole: {
    fontSize: "12px",
    color: "var(--text-muted)"
  }
};