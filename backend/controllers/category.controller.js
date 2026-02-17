const categoryService = require('../services/category.service');
const sendResponse = require('../src/utils/apiResponse');

exports.getCategories = async (req, res) => {
    try {
        const categories = await categoryService.getCategories();
        return sendResponse(res, {
            data: categories,
            message: "Successfully fetched category data."
        });
    } catch (err) {
        console.error(err);
        return sendResponse(res, {
            status: err.status ?? false,
            statusCode: err.statusCode ?? 500,
            message: err.message ?? "Failed to fetch categories."
        });
    }
}

exports.getCategoryByCode = async (req, res) => {
    try {
        const category = await categoryService.getCategoryByCode(req.params.code);
        return sendResponse(res, { data: category });
    } catch (err) {
        console.error(err);
        return sendResponse(res, {
            status: err.status ?? false,
            statusCode: err.statusCode ?? 500,
            message: err.message ?? "Failed to fetch category."
        });
    }
}

exports.createCategory = async (req, res) => {
    try {
        const category = await categoryService.createCategory(req.body);
        return sendResponse(res, {
            statusCode: 201,
            data: category,
            message: "Category is created successfully."
        });
    } catch (err) {
        console.error(err);
        return sendResponse(res, {
            status: err.status ?? false,
            statusCode: err.statusCode ?? 500,
            message: err.message ?? "Failed to create category."
        });
    }
}

exports.updateCategoryByCode = async (req, res) => {
    try {
        const category = await categoryService.updateCategory(
            req.params.code,
            req.body
        );

        return sendResponse(res, {
            data: category,
            message: 'Category is updated successfully.'
        });

    } catch (err) {
        console.error(err);
        return sendResponse(res, {
            status: err.status ?? false,
            statusCode: err.statusCode ?? 500,
            message: err.message ?? 'Failed to update category.'
        });
    }
};

exports.deleteCategoryByCode = async (req, res) => {
    try {
        const category = await categoryService.deleteCategory(req.params.code);
        return sendResponse(res, {
            data: category,
            message: "Category is deleted successfully."
        });
    } catch (err) {
        console.error(err);
        return sendResponse(res, {
            status: err.status ?? false,
            statusCode: err.statusCode ?? 500,
            message: err.message ?? "Failed to delete category."
        });
    }
};
