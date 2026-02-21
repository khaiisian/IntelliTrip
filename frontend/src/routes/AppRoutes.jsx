import React from 'react'
import {Routes, Route} from "react-router-dom";
import Login from '../pages/Auth/Login.jsx'
import Home from '../pages/User/Home.jsx'
import ProtectedRoute from "./ProtectedRoute.jsx";
import Register from "../pages/Auth/Register.jsx";

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
                path="/home"
                element={
                    <ProtectedRoute>
                        <Home />
                    </ProtectedRoute>
                }
            />
        </Routes>
    )
}

export default AppRoutes;
