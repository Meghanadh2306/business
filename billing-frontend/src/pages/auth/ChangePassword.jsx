import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function ChangePassword() {
  const { username } = useAuth();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChangePassword = (e) => {
    e.preventDefault();

    const storedPwd = localStorage.getItem(`password_${username}`) || `${username}123`;

    if (currentPassword !== storedPwd) {
      toast.error("Current password is incorrect");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    // Save new password
    localStorage.setItem(`password_${username}`, newPassword);
    toast.success("Password updated successfully!");
    
    // Redirect to dashboard
    navigate("/");
  };

  return (
    <div style={{ maxWidth: "400px", margin: "40px auto" }}>
      <div className="card glass">
        <h2 className="text-2xl font-bold mb-2">Change Password</h2>
        <p className="text-muted mb-6">Update the password for your account ({username}).</p>

        <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ fontSize: "14px", fontWeight: "600", display: "block", marginBottom: "8px" }}>
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              style={{
                width: "100%", padding: "10px", borderRadius: "8px", 
                border: "1px solid var(--border-color)", background: "var(--bg-color)", color: "var(--text-main)"
              }}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: "14px", fontWeight: "600", display: "block", marginBottom: "8px" }}>
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              style={{
                width: "100%", padding: "10px", borderRadius: "8px", 
                border: "1px solid var(--border-color)", background: "var(--bg-color)", color: "var(--text-main)"
              }}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: "14px", fontWeight: "600", display: "block", marginBottom: "8px" }}>
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              style={{
                width: "100%", padding: "10px", borderRadius: "8px", 
                border: "1px solid var(--border-color)", background: "var(--bg-color)", color: "var(--text-main)"
              }}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ marginTop: "10px", padding: "12px", width: "100%" }}
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}
