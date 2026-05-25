Profile image upload notes

- This backend uses `multer` to handle profile image uploads.
- Uploads are saved to `/uploads/profile-images` and served statically at `/uploads`.
- After pulling changes, run:

```
cd backend
npm install
```

- The API endpoint for current user profile update is `PUT /auth/profile` and accepts `multipart/form-data` with the field `profile_image`.
- To remove an existing image, include the form field `remove_image=true`.
- Maximum allowed file size: 2MB. Allowed formats: jpg, jpeg, png, webp.
