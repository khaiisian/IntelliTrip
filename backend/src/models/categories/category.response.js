class CategoryResponse {
    constructor(category) {
        this.category_id = category.category_id;
        this.category_code = category.category_code;
        this.category_name = category.category_name;
        this.created_at = category.created_at;
        this.modified_at = category.modified_at;
    }
}

module.exports = CategoryResponse;