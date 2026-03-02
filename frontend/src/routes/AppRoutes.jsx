import React from 'react'
import {Routes, Route} from "react-router-dom";
import Login from '../pages/Auth/Login.jsx'
import Home from '../pages/User/Home.jsx'
import ProtectedRoute from "./ProtectedRoute.jsx";
import Register from "../pages/Auth/Register.jsx";
import MainLayout from "../components/layouts/MainLayout.jsx";

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
                element={
                    <ProtectedRoute>
                        <MainLayout />
                    </ProtectedRoute>
                }
            >
                <Route path="/" element={<Home />} />
            </Route>

            <Route path="/home" element={<Home />} />

        </Routes>
    )
}

export default AppRoutes;
