import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getUserByCode, updateUser } from "../../../api/user.api.js";
import { UserForm } from "./UserForm.jsx";

export const EditUserPage = () => {
    const { code } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [initialValues, setInitialValues] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                setLoading(true);
                setError("");
                const res = await getUserByCode(code);
                const user = res.data.data;

                setInitialValues({
                    user_name: user.user_name || "",
                    email: user.email || "",
                    role: user.role || "user",
                    profile_image: user.profile_image || "",
                    password: "" // Always empty for edit form
                });
            } catch (err) {
                console.error(err);
                setError(err?.response?.data?.message || "Failed to load user");
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [code]);

    const handleSubmit = async (payload) => {
        setError("");
        try {
            await updateUser(code, payload);
            navigate("/admin/users");
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.message || "Failed to update user");
        }
    };

    return (
        <UserForm
            title="Edit User"
            description="Update user details."
            submitLabel="Update User"
            submittingLabel="Updating..."
            initialValues={initialValues}
            loading={loading}
            error={error}
            onSubmit={handleSubmit}
        />
    );
};