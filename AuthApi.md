## Authentication API Documentation

### Base URL

`/api/auth/`

---

### `POST /register`

#### Description

This endpoint registers a new user. Upon successful registration, an email verification OTP will be sent to the provided email address.

#### Request

- **Headers**
  - `Content-Type: application/json`

- **Body**: 
  ```json
  {
    "email": "string", // required
    "password": "string", // required
    "firstName": "string", // required
    "lastName": "string", // required
    "listOfInterest": ["string"], // required
    "tel": "string", // required
    "birthDate": "YYYY-MM-DD", // required
    "maritalStatus": "string",
    "address": "string", 
    "gender": "string"
  }
  ```

 - **Responses**
   - **201 Created**
       : Indicates that the user has been created successfully.
   
   - **400 Bad Request**
     - Missing Email: The email field is missing.
     - User Already Exists: An account with the provided email already exists.
     - User Already Exists but Email is Not Verified: The email is not verified for the existing account.
   
   - **500 Internal Server Error**
     - Indicates an unexpected error occurred during the request processing.

### Additional Information
 - An OTP will be sent to the user's email for verification purposes.
 - Ensure that the provided email is unique and valid.
 - Passwords will be hashed before storage to maintain security.

### `POST /verify-email`

#### Description

This endpoint verifies a user's email address using an OTP (One-Time Password). If the OTP is valid and not expired, the user's email will be marked as verified, and a token will be issued for authentication.

#### Request

- **Headers**
  - `Content-Type: application/json`

- **Body**: 
  ```json
  {
    "email": "string",
    "otp": "string"
  }

 - **Responses**
   - **200 OK**
      ```json
      {
        "status": "success",
        "message": "Email verified successfully",
        "token": "string"
      }
      ```
   
   - **400 Bad Request**
     - Missing Email: The email field is missing.
     - OTP is required: The OTP field is missing.
     - User Not Found: The user with the provided email was not found.
     - Invalid OTP: The provided OTP does not match the one stored for the user.
     - OTP has expired: The OTP has expired and is no longer valid.
   
   - **500 Internal Server Error**
     - Indicates an unexpected error occurred during the request processing.

### Additional Information

 - Ensure that the provided OTP matches the one sent to the user's email.
 - The OTP will expire 15 minutes after it is generated.
 - Upon successful verification, a token will be generated and stored in Redis for authentication purposes.


### `POST /login`

#### Description

This endpoint authenticates a user by checking their email and password. If the credentials are correct and the email is verified, a token is issued for further authentication.

#### Request

- **Headers**
  - `Content-Type: application/json`

- **Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Responses**
   - **200 OK**
      ```json
      {
        "status": "success",
        "message": "Login Successful",
        "token": "string"
      }
      ```
   
   - **400 Bad Request**
     - Missing Email: The email field is missing.
     - Password is required: The password field is missing.
     - Account Not Found: No account was found with the provided email.
     - Email is not Verified: The user's email has not been verified.
     - Invalid password: The provided password is incorrect.
   
   - **500 Internal Server Error**
     - Indicates an unexpected error occurred during the request processing.

### Additional Information

 - Ensure that the email is verified before attempting to log in.
 - A token will be generated and stored in Redis for authentication purposes, expiring in one hour.


### `POST /logout`

#### Description

This endpoint logs out a user by invalidating their authentication token. It removes the token from Redis, ensuring that it can no longer be used for authentication.

#### Request

- **Headers**
  - `Authorization: Bearer <token>`

#### Responses

- **200 OK**
  - **Body**:
    ```json
    {
      "message": "Logout successful"
    }
    ```
  - Indicates that the logout was successful, and the token has been invalidated.

- **401 Unauthorized**
  - `No token provided`: The `Authorization` header is missing or does not contain a token.

- **500 Internal Server Error**
  - Indicates an unexpected error occurred during the request processing.

#### Additional Information

- Ensure that the `Authorization` header includes the token in the format `Bearer <token>`.
- The token will be removed from Redis, making it invalid for future requests.


### `POST /forgot-password`

#### Description

This endpoint initiates the password reset process for a user. It generates a reset token, stores it in Redis, and sends a password reset link to the user's email.

#### Request

- **Body**:
  ```json
  {
    "email": "<user-email>"
  }

#### Responses

- **200 OK**
  - **Body**:
    ```json
    {
      "status": "success",
      "message": "Password reset email sent",
      "resetUrl": "http://localhost:3000/api/auth/reset-password?token=<reset-token>" // api Url to make request to change the pwd
    }
    ```
  - Indicates that the password reset email has been sent successfully. The resetUrl is included for the user to reset their password.

- **400 Bad Request**
  - Email is required: The email field is missing from the request body.

- **404 Not Found**
  - User not found: No user exists with the provided email address.

- **500 Internal Server Error**
  - Indicates an unexpected error occurred during the request processing.

### Additional Information

 - A reset token is generated and stored in Redis with a 1-hour expiration time.
 - The reset URL includes the token and should be used by the user to reset their password.
 - Ensure that the email configuration and Redis setup are correctly configured for sending emails and storing reset tokens.


### `POST /reset-password`

#### Description

This endpoint allows a user to reset their password using a valid reset token. The new password is hashed and saved for the user, and the reset token is removed from Redis.

#### Request

- **Query Parameters**:
  - `token` (required): The password reset token sent to the user's email.

- **Body**:
  ```json
  {
    "newPassword": "<new-password>"
  }
  ```

#### Responses

- **200 OK**
  - **Body**:
    ```json
    {
      "message": "Password successfully reset"
    }
    ```
  - Indicates that the password has been successfully reset.

- **400 Bad Request**
  - Token, and new password are required: Either the token or newPassword field is missing from the request.
   - Invalid or expired token: The provided token is invalid or has expired.

- **404 Not Found**
  - User not found: No user exists with the provided ID from the token..

- **500 Internal Server Error**
  - Indicates an unexpected error occurred during the request processing.

### Additional Information

 - The reset token must be valid and not expired to reset the password.
 - The token is removed from Redis after a successful password reset.
 - Ensure that the Redis client and user model methods (hashPassword, findById, etc.) are correctly configured for proper functionality.
 