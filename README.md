# User Management API

This project is a RESTful API for managing users, including functionalities for user creation, editing user details, uploading images, retrieving all users, and deleting a user. The API is built using Node.js, Express, MongoDB, and Multer for file handling.

## Features
- **User Creation**: Create a new user with email, full name, and password.
- **User Editing**: Edit the full name and password of an existing user (email cannot be changed).
- **Image Upload**: Upload a profile image (supports JPEG, PNG, and GIF formats).
- **Get All Users**: Retrieve a list of all registered users.
- **Delete User**: Delete a user by their email.
- **Validation**: Enforces strong password rules and validates user inputs.

## Technologies Used
- **Node.js**: Backend runtime environment.
- **Express**: Web framework for building APIs.
- **MongoDB**: NoSQL database for storing user data.
- **Multer**: Middleware for handling multipart/form-data (used for image uploads).
- **bcrypt**: For secure password hashing.
- **Postman**: For testing API endpoints.


## API Endpoints

| Method | Endpoint               | Description                  |
|--------|-------------------------|------------------------------|
| POST   | `/user/create`          | Create a new user            |
| PUT    | `/user/edit`            | Edit user details            |
| POST   | `/user/uploadImage`     | Upload a profile image       |
| GET    | `/user/getAll`          | Retrieve all users           |
| DELETE | `/user/delete`          | Delete a user by email       |

### Validation Rules:
- **Full Name**: Must contain only alphabets and spaces.
- **Password**: Must be at least 8 characters long, with at least one uppercase letter, one number, and one special character.

### Image Upload:
- **Supported Formats**: JPEG, PNG, GIF.
- **Storage Path**: Uploaded images are stored in the `/uploads` folder.



## Example Requests

### Create User
```json
Endpoint: POST /user/create
{
  "email": "user@example.com",
  "fullName": "John Doe",
  "password": "StrongPass@123"
}
Endpoint: GET /user/getAll
Endpoint: DELETE /user/delete
{
  "email": "user@example.com"
}
Endpoint: PUT /user/edit
{
  "email": "user@example.com",
  "fullName": "John Doe",
  "password": "StrongPass@123"
}
Endpoint: POST /user/uploadImage
using form-data
image: path 
email: email of user
