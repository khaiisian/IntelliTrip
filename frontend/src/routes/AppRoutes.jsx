import React from 'react';
import {Routes, Route, Navigate} from "react-router-dom";
import Login from '../pages/Auth/Login.jsx';
import Home from '../pages/User/Home.jsx';
import ProtectedRoute from "./ProtectedRoute.jsx";
import Register from "../pages/Auth/Register.jsx";
import MainLayout from "../components/layouts/MainLayout.jsx";
import AdminLayout from "../components/layouts/AdminLayout.jsx";
import DashboardPage from "../pages/Admin/Dashboard/DashboardPage.jsx";
import {CreateAttractionPage} from "../pages/Admin/Attractions/CreateAttractionPage.jsx";
import {AttractionListPage} from "../pages/Admin/Attractions/AttractionListPage.jsx";
import {EditAttractionPage} from "../pages/Admin/Attractions/EditAttractionPage.jsx";
import {CreateTripPage} from "../pages/User/CreateTripPage.jsx";
import {TripSchedulePage} from "../pages/User/TripSchedulePage.jsx";
import {TripPreferencePage} from "../pages/User/TripPreferencePage.jsx";
import {TripItineraryPage} from "../pages/User/ItineraryPage.jsx";
import {ItineraryListingPage} from "../pages/User/ItineraryListingPage.jsx";
import {TripsPage} from "../pages/User/TripListPage.jsx";
import {TripDetailPage} from "../pages/User/TripDetailPage.jsx";
import {ProfilePage} from "../pages/User/ProfilePage.jsx";

const AppRoutes = () => {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Customer routes - only accessible by users with role 'customer' */}
            <Route
                element={
                    <ProtectedRoute requiredRole="customer">
                        <MainLayout />
                    </ProtectedRoute>
                }
            >
                <Route path="/" element={<Home />} />
                <Route path="/home" element={<Home />} />

                <Route path="/tripLists" element={<TripsPage />} />
                <Route path="/tripDetail/:tripCode" element={<TripDetailPage />} />
                <Route path="/createTrip" element={<CreateTripPage />} />

                <Route path="/tripSchedule/:tripCode" element={<TripSchedulePage />} />
                <Route path="/tripPreference/:tripCode" element={<TripPreferencePage />}/>
                <Route path="/trip/:tripCode/itinerary" element={<TripItineraryPage />}/>
                <Route path="/itineraries" element={<ItineraryListingPage />}/>
                <Route path="/profile" element={<ProfilePage />}/>
            </Route>

            {/* Admin routes - only accessible by users with role 'admin' */}
            <Route
                element={
                    <ProtectedRoute requiredRole="admin">
                        <AdminLayout />
                    </ProtectedRoute>
                }
            >
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/admin/dashboard" element={<DashboardPage />} />
                <Route path="/admin/attractions" element={<AttractionListPage />} />
                <Route path="/admin/attractions/create" element={<CreateAttractionPage />} />
                <Route path="/admin/attractions/:code/edit" element={<EditAttractionPage />} />
            </Route>

            {/* Catch all - 404 route */}
            <Route path="*" element={<div>404 - Page Not Found</div>} />
        </Routes>
    );
};

export default AppRoutes;
