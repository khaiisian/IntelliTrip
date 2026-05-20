import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAttractionByCode, updateAttraction } from "../../../api/attraction.api.js";
import { AttractionForm } from "./AttractionForm.jsx";

const toTimeInput = (value) => {
    if (!value) return "";
    if (typeof value === "string" && /^\d{2}:\d{2}/.test(value)) return value.slice(0, 5);
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().slice(11, 16);
};

export const EditAttractionPage = () => {
    const { code } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [initialValues, setInitialValues] = useState(null);

    useEffect(() => {
        const fetchAttraction = async () => {
            try {
                setLoading(true);
                setError("");
                const res = await getAttractionByCode(code);
                const attraction = res.data.data;

                setInitialValues({
                    attraction_name: attraction.name || "",
                    latitude: attraction.latitude?.toString() || "",
                    longitude: attraction.longitude?.toString() || "",
                    category_id: attraction.category?.category_id?.toString() || "",
                    cost: attraction.cost?.toString() || "",
                    duration_minutes: attraction.duration_minutes?.toString() || "",
                    open_time: toTimeInput(attraction.open_time),
                    close_time: toTimeInput(attraction.close_time)
                });
            } catch (err) {
                console.error(err);
                setError(err?.response?.data?.message || "Failed to load attraction");
            } finally {
                setLoading(false);
            }
        };

        fetchAttraction();
    }, [code]);

    const handleSubmit = async (payload) => {
        setError("");
        try {
            await updateAttraction(code, payload);
            navigate("/admin/attractions");
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.message || "Failed to update attraction");
        }
    };

    return (
        <AttractionForm
            title="Edit Attraction"
            description="Update attraction details, operating hours, category, and map location."
            submitLabel="Update Attraction"
            submittingLabel="Updating..."
            initialValues={initialValues}
            loading={loading}
            error={error}
            onSubmit={handleSubmit}
        />
    );
};
