class UserResponse{
    constructor(user){
        this.user_id = user.user_id,
        this.user_name = user.user_name,
        this.email  = user.email,
        this.profile_image = user.profile_image,
        this.created_at  = user.created_at
    }
}

module.exports = UserResponse;
