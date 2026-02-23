class CreateUserRequest {
    constructor({ user_name, email, password, profile_image }) {
        this.user_name = user_name;
        this.email = email;
        this.password = password;
        this.profile_image = profile_image ?? null;
    }
}

class RegisterUserRequest {
    constructor(user) {
        this.user_name = user.user_name;
        this.email = user.email;
        this.password = user.password;
    }
}

class UpdateUserRequest {
    constructor({ user_name, email, profile_image }) {
        this.user_name = user_name;
        this.email = email;
        this.profile_image = profile_image;
    }
}

class LoginUserRequest {
    constructor(user) {
        this.email = user.email;
        this.password = user.password;
    }
}

module.exports = {
    CreateUserRequest,
    UpdateUserRequest,
    LoginUserRequest,
    RegisterUserRequest
}