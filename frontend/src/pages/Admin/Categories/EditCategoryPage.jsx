import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCategoryByCode, updateCategory } from "../../../api/category.api.js";
import { CategoryForm } from "./CategoryForm.jsx";

export const EditCategoryPage = () => {
    const { code } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [initialValues, setInitialValues] = useState(null);

    useEffect(() => {
        const fetch = async () => {
            try {
                setLoading(true);
                setError("");
                const res = await getCategoryByCode(code);
                const c = res.data.data;
                setInitialValues({ category_name: c.category_name || "" });
            } catch (err) {
                console.error(err);
                setError(err?.response?.data?.message || 'Failed to load category');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [code]);

    const handleSubmit = async (payload) => {
        setError("");
        try {
            await updateCategory(code, payload);
            navigate('/admin/categories');
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.message || 'Failed to update category');
        }
    };

    return (
        <CategoryForm
            title="Edit Category"
            description="Update category name."
            submitLabel="Update Category"
            submittingLabel="Updating..."
            initialValues={initialValues}
            loading={loading}
            error={error}
            onSubmit={handleSubmit}
        />
    );
};

export default EditCategoryPage;
