import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const navigate = useNavigate();

    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // ✅ Check token on app load
    useEffect(() => {
        const storedToken = sessionStorage.getItem("token");

        if (storedToken) {
            setToken(storedToken);
        }

        setLoading(false);
    }, []);

    // 🔐 LOGIN
    const login = (tokenData) => {
        sessionStorage.setItem("token", tokenData);
        setToken(tokenData);

        navigate("/dashboard"); // change if needed
    };

    // 🚪 LOGOUT
    const logout = () => {
        sessionStorage.removeItem("token");
        setToken(null);

        navigate("/");
    };

    // ✅ AUTH CHECK
    const isAuthenticated = !!token;

    return (
        <AuthContext.Provider
            value={{
                token,
                login,
                logout,
                isAuthenticated,
                loading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// 🔁 Custom Hook
export function useAuth() {
    return useContext(AuthContext);
}