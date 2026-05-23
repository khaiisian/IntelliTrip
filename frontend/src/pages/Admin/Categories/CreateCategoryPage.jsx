import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCategory } from "../../../api/category.api.js";
import { CategoryForm } from "./CategoryForm.jsx";

export const CreateCategoryPage = () => {
    const navigate = useNavigate();
    const [error, setError] = useState("");

    const handleSubmit = async (payload) => {
        setError("");
        try {
            await createCategory(payload);
            navigate('/admin/categories');
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.message || 'Failed to create category');
        }
    };

    return (
        <CategoryForm
            title="Create New Category"
            description="Add a category used to group attractions."
            submitLabel="Create Category"
            submittingLabel="Creating..."
            error={error}
            onSubmit={handleSubmit}
        />
    );
};

export default CreateCategoryPage;
