const categoryRepository = require('../repositories/category.repository');
const CategoryResponse = require('../models/categories/category.response');
const { CreateCategoryRequest, UpdateCategoryRequest } = require('../models/categories/category.model');
const generateCode = require('../src/utils/generateCode');

exports.getCategories = async () => {
    const categories = await categoryRepository.findAll();
    return categories.map(x => new CategoryResponse(x));
}

exports.getCategoryById = async (id) => {
    const category = await categoryRepository.findById(id);
    if (!category) return new Error('Category not found');
    return new CategoryResponse(category);
}

exports.createCategory = async (payload) => {
    const request = new CreateCategoryRequest(payload);

    const existing = await categoryRepository.findAll();
    if (existing.some(x => x.category_name.toLowerCase() === request.category_name.toLowerCase())) {
        throw new Error("Category name already exists.");
    }

    const category_code = await generateCategoryCode();
    request.category_code = category_code;

    const category = await categoryRepository.create(request);
    return new CategoryResponse(category);
}

exports.updateCategory = async (id, payload) => {
    const request = new UpdateCategoryRequest(payload);
    const category = await categoryRepository.update(id, request);
    return new CategoryResponse(category);
}

exports.deleteCategory = async (id) => {
    const category = await categoryRepository.remove(id);
    return new CategoryResponse(category);
}