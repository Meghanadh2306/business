import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext"; // ✅ use context

export default function Login() {
  const { login } = useAuth(); // ✅ use context login
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    if (username === "omkarsai" && password === "omkarsai123") {

      // ✅ store session (fake token)
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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-color)',
      padding: '20px'
    }}>
      <div className="card glass" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '10px' }}>🥛</div>
        <h2 style={{ marginBottom: '8px' }}>Omkar Sai Dairy</h2>
        <p className="text-muted" style={{ marginBottom: '24px' }}>
          Sign in to manage your dairy
        </p>

        {error && (
          <div style={{
            color: '#ef4444',
            background: '#fee2e2',
            padding: '10px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <div style={{ textAlign: 'left' }}>
            <label style={{ fontSize: '13px', marginBottom: '6px', fontWeight: 600 }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError("");
              }}
              required
            />
          </div>

          <div style={{ textAlign: 'left' }}>
            <label style={{ fontSize: '13px', marginBottom: '6px', fontWeight: 600 }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              required
            />
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '8px', padding: '12px' }}>
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}