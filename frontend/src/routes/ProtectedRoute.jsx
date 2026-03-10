import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

export default function ProtectedRoute({ children, requiredRole }) {
    const { isAuthenticated, loading, user } = useAuth();

    if (loading) return null;

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    // Check if role is required and user has the correct role
    if (requiredRole && user?.user_role !== requiredRole) {
        // Redirect to appropriate home page based on user's actual role
        if (user?.user_role === 'admin') {
            return <Navigate to="/admin/dashboard" />;
        } else {
            return <Navigate to="/home" />;
        }
    }

    return children;
}