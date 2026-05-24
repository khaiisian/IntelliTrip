import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUser } from "../../../api/user.api.js";
import { UserForm } from "./UserForm.jsx";

export const CreateUserPage = () => {
    const navigate = useNavigate();
    
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const handleSubmit = async (payload) => {
        setErrors({});
        setLoading(true);
        setSuccessMessage("");
        
        try {
            await createUser(payload);
            setSuccessMessage("User created successfully!");
            setTimeout(() => {
                navigate("/admin/users");
            }, 1500);
        } catch (err) {
            console.error(err);
            if (err.response?.data?.errors) {
                setErrors(err.response.data.errors);
            } else {
                setErrors({ submit: err.response?.data?.message || "Failed to create user" });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <UserForm
            title="Create New User"
            description="Fill in the details to create a new user account."
            submitLabel="Create User"
            submittingLabel="Creating..."
            loading={loading}
            error={errors.submit || ""}
            onSubmit={handleSubmit}
        />
    );
};