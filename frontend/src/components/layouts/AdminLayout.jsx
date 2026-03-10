import React from 'react'
import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar.jsx";

const AdminLayout = () => {
    return (
        <div className="flex min-h-screen">
            <Sidebar />

            <div className="flex flex-col flex-grow">
                <main className="flex-grow p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default AdminLayout
