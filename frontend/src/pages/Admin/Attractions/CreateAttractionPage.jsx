import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createAttraction } from "../../../api/attraction.api.js";
import { AttractionForm } from "./AttractionForm.jsx";

export const CreateAttractionPage = () => {
    const navigate = useNavigate();
    const [error, setError] = useState("");

    const handleSubmit = async (payload) => {
        setError("");
        try {
            await createAttraction(payload);
            navigate("/admin/attractions");
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.message || "Failed to create attraction");
        }
    };

    return (
        <AttractionForm
            title="Create New Attraction"
            description="Add a new attraction with location, category, cost, and visiting hours."
            submitLabel="Create Attraction"
            submittingLabel="Creating..."
            error={error}
            onSubmit={handleSubmit}
        />
    );
};
