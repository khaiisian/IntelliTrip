class CreateUserRequest {
    constructor({ user_name, email, password, profile_image }) {
        this.user_name = user_name;
        this.email = email;
        this.password = password;
        this.profile_image = profile_image ?? null;
    }
}

class UpdateUserRequest {
    constructor({ user_name, email, profile_image }) {
        this.user_name = user_name;
        this.email = email;
        this.profile_image = profile_image;
    }
}

module.exports = {
    CreateUserRequest,
    UpdateUserRequest
}