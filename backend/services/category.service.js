const categoryRepository = require('../repositories/category.repository');
const CategoryResponse = require('../models/categories/category.response');
const { CreateCategoryRequest, UpdateCategoryRequest } = require('../models/categories/category.model');
const generateCode = require('../src/utils/generateCode');

exports.getCategories = async () => {
    const categories = await categoryRepository.findAll();
    return categories.map(x => new CategoryResponse(x));
}

exports.getCategoryByCode = async (code) => {
    const category = await categoryRepository.findByCode(code);
    if (!category) throw { status: false, statusCode: 404, message: 'Category not found' };
    return new CategoryResponse(category);
}

exports.createCategory = async (payload) => {
    const request = new CreateCategoryRequest(payload);

    request.category_name = request.category_name?.trim();
    if (!request.category_name)
        throw { status: false, statusCode: 400, message: 'Category name is required' };

    const existing = await categoryRepository.findByName(request.category_name);
    if (existing)
        throw { status: false, statusCode: 409, message: 'Category name already exists' };

    request.category_code = await generateCode(
        'tbl_category',
        'category_code',
        'CAT'
    );

    const category = await categoryRepository.create(request);
    return new CategoryResponse(category);
};

exports.updateCategory = async (code, payload) => {
    if (!code)
        throw { status: false, statusCode: 400, message: 'Category code is required' };

    const existing = await categoryRepository.findByCode(code);
    if (!existing)
        throw { status: false, statusCode: 404, message: 'Category not found' };

    const request = new UpdateCategoryRequest(payload);

    if (request.category_name !== undefined) {
        request.category_name = request.category_name.trim();
        if (!request.category_name)
            throw { status: false, statusCode: 400, message: 'Invalid category name' };

        const duplicate = await categoryRepository.findByName(request.category_name);
        if (duplicate && duplicate.category_code !== code)
            throw { status: false, statusCode: 409, message: 'Category name already exists' };
    }

    const category = await categoryRepository.updateByCode(code, request);
    return new CategoryResponse(category);
};

exports.deleteCategory = async (code) => {
    const existing = await categoryRepository.findByCode(code);
    if (!existing) throw { status: false, statusCode: 404, message: 'Category not found' };

    const category = await categoryRepository.removeByCode(code);
    return new CategoryResponse(category);
}