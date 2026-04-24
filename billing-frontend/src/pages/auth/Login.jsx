import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    if (username === "omkarsai" && password === "omkarsai123") {
      const fakeToken = "dairy-session-token";
      login(fakeToken);

      toast.success("Welcome back!");
      navigate("/");
    } else {
      setError("Invalid credentials. Try omkarsai / omkarsai123");
      toast.error("Invalid credentials");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        background: "#f5f7fa",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "380px",
          background: "#fff",
          padding: "24px",
          borderRadius: "16px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        {/* HEADER */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div style={{ fontSize: "40px", marginBottom: "8px" }}>🥛</div>

          <h2
            style={{
              margin: 0,
              fontSize: "20px",
              fontWeight: "700",
              color: "#222",
            }}
          >
            OmkarSai Thirumula Parlour
          </h2>

          <p style={{ fontSize: "13px", color: "#666", marginTop: "6px" }}>
            Manage your dairy easily
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div
            style={{
              background: "#fee2e2",
              color: "#dc2626",
              padding: "10px",
              borderRadius: "8px",
              fontSize: "13px",
              marginBottom: "16px",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        {/* FORM */}
        <form
          onSubmit={handleLogin}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          {/* USERNAME */}
          <div>
            <label
              style={{
                fontSize: "13px",
                fontWeight: "600",
                marginBottom: "5px",
                display: "block",
              }}
            >
              Username
            </label>

            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError("");
              }}
              placeholder="Enter username"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid #ddd",
                fontSize: "14px",
                outline: "none",
              }}
              required
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label
              style={{
                fontSize: "13px",
                fontWeight: "600",
                marginBottom: "5px",
                display: "block",
              }}
            >
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              placeholder="Enter password"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid #ddd",
                fontSize: "14px",
                outline: "none",
              }}
              required
            />
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            style={{
              marginTop: "8px",
              padding: "12px",
              borderRadius: "10px",
              border: "none",
              background: "#2563eb",
              color: "#fff",
              fontWeight: "600",
              fontSize: "15px",
              cursor: "pointer",
            }}
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}