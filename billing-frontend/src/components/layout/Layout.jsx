import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { Toaster } from "react-hot-toast";

export default function Layout({ setAuth }) {
  const [open, setOpen] = useState(window.innerWidth > 768);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setOpen(false);
      } else {
        setOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={styles.container}>
      <Toaster position="top-right" />
      {/* Sidebar */}
      <Sidebar open={open} setOpen={setOpen} />

      {/* Overlay for mobile */}
      {open && window.innerWidth <= 768 && (
        <div
          onClick={() => setOpen(false)}
          style={styles.overlay}
        />
      )}

      {/* Main Content */}
      <div
        style={{
          ...styles.main,
          marginLeft: open && window.innerWidth > 768 ? "250px" : "0"
        }}
      >
        <Navbar setOpen={setOpen} setAuth={setAuth} />

        <div style={styles.content}>
          <div style={styles.contentInner}>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    width: "100%",
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    transition: "margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    width: "100%",
    minWidth: 0,
  },
  content: {
    flex: 1,
    padding: "32px",
    background: "var(--bg-color)",
    overflowX: "hidden",
  },
  contentInner: {
    maxWidth: "1400px",
    margin: "0 auto",
  },
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(15, 23, 42, 0.5)",
    backdropFilter: "blur(4px)",
    zIndex: 999
  }
};