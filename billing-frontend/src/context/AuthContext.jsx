import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // 🔐 Load session on app start
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

        // 🔥 force refresh (more reliable than navigate)
        window.location.href = "/";
    };

    // 🚪 LOGOUT (FIXED)
    const logout = () => {
        sessionStorage.clear(); // 🔥 clear everything
        setToken(null);

        // small delay ensures state clears
        setTimeout(() => {
            window.location.href = "/login";
        }, 50);
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

// 🔁 Hook
export function useAuth() {
    return useContext(AuthContext);
}