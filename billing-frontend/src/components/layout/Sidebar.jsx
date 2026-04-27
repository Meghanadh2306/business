import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Sidebar({ open, setOpen }) {
  const location = useLocation();
  const { username } = useAuth();
  const isVijaya = username === "vijaya";
  const brandName = isVijaya ? "Vijaya Base" : "Omkar Sai Base";
  const footerName = isVijaya ? "Vijaya Dairy" : "Omkar Sai Dairy";

  const links = [
    { name: "Dashboard", path: "/", icon: "🏠" },
    { name: "Create Bill", path: "/create", icon: "🧾" },
    { name: "Bills", path: "/bills", icon: "📄" },
    { name: "Customers", path: "/customers", icon: "👥" },
    { name: "Products", path: "/products", icon: "📦" },
    { name: "Reports", path: "/reports", icon: "📊" },
  ];

  return (
    <div style={{
      ...styles.sidebar,
      transform: open ? "translateX(0)" : "translateX(-100%)",
    }}>
      <div style={styles.header}>
        <div style={styles.logoBox}>
          🥛
        </div>
        <h2 style={styles.logoText}>{brandName}</h2>
      </div>

      <nav style={styles.navContainer}>
        {links.map((link) => {
          const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
          return (
            <Link 
              key={link.path}
              to={link.path} 
              style={{
                ...styles.link,
                background: isActive ? 'var(--primary)' : 'transparent',
                color: isActive ? '#fff' : 'var(--sidebar-text)',
                fontWeight: isActive ? 600 : 400
              }} 
              onClick={() => setOpen(false)}
            >
              <span style={styles.icon}>{link.icon}</span>
              {link.name}
            </Link>
          )
        })}
      </nav>
      
      <div style={styles.footer}>
        <p style={{fontSize: '12px', color: 'var(--text-muted)'}}>© 2026 {footerName}</p>
      </div>
    </div>
  );
}

const styles = {
  sidebar: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "250px",
    height: "100vh",
    background: "var(--sidebar-bg)",
    color: "var(--sidebar-text)",
    transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    zIndex: 1000,
    display: "flex",
    flexDirection: "column",
    boxShadow: "var(--shadow-lg)"
  },
  header: {
    padding: "30px 24px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    borderBottom: "1px solid var(--border-color)"
  },
  logoBox: {
    background: "linear-gradient(135deg, var(--primary), #38bdf8)",
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    boxShadow: "0 4px 10px rgba(2, 132, 199, 0.4)"
  },
  logoText: {
    color: "var(--text-main)",
    margin: 0,
    fontSize: "20px",
    fontWeight: 700,
    letterSpacing: "0.5px"
  },
  navContainer: {
    padding: "24px 16px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    flex: 1
  },
  link: {
    display: "flex",
    alignItems: "center",
    padding: "12px 16px",
    borderRadius: "10px",
    textDecoration: "none",
    transition: "all 0.2s ease",
  },
  icon: {
    marginRight: "12px",
    fontSize: "18px"
  },
  footer: {
    padding: "20px",
    borderTop: "1px solid var(--border-color)",
    textAlign: "center"
  }
};