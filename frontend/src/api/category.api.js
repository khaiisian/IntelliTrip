import api from "../api/axios.js";

// Create category
export const createCategory = (data) =>
    api.post("/categories", data);

// Get all categories
export const getCategories = () =>
    api.get("/categories");

// Get single category by code
export const getCategoryByCode = (code) =>
    api.get(`/categories/${code}`);

// Update category
export const updateCategory = (code, data) =>
    api.put(`/categories/${code}`, data);

// Delete category
export const deleteCategory = (code) =>
    api.delete(`/categories/${code}`);