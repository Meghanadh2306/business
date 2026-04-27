import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [token, setToken] = useState(null);
    const [username, setUsername] = useState(null);
    const [loading, setLoading] = useState(true);

    // 🔐 Load session on app start
    useEffect(() => {
        const storedToken = sessionStorage.getItem("token");
        const storedUsername = sessionStorage.getItem("username");

        if (storedToken) {
            setToken(storedToken);
            setUsername(storedUsername || "omkarsai");
        }

        setLoading(false);
    }, []);

    // 🔐 LOGIN
    const login = (tokenData, usernameData = "omkarsai") => {
        sessionStorage.setItem("token", tokenData);
        sessionStorage.setItem("username", usernameData);
        setToken(tokenData);
        setUsername(usernameData);

        // 🔥 force refresh (more reliable than navigate)
        window.location.href = "/";
    };

    // 🚪 LOGOUT (FIXED)
    const logout = () => {
        sessionStorage.clear(); // 🔥 clear everything
        setToken(null);
        setUsername(null);

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
                username,
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