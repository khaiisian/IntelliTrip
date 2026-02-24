import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadUser = async () => {
        try {
            const res = await api.get("/auth/me");
            setUser(res.data.data);
            console.log(res.data.data);
        } catch (err) {
            setUser(null);
            console.log(err.response)
            localStorage.removeItem("token");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (token) {
            loadUser();
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (data) => {
        // Save access token from backend
        localStorage.setItem("token", data.token);
        await loadUser(); // fetch user data
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !user,
                login,
                logout,
                loading
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);