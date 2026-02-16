class CreateCategoryRequest {
    constructor({ category_name }) {
        this.category_name = category_name
    }
}

class UpdateCategoryRequest {
    constructor({ category_name }) {
        this.category_name = category_name
    }
}

module.exports = {
    CreateCategoryRequest, UpdateCategoryRequest
}