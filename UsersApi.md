# User API Documentation

## Introduction

This API provides a set of endpoints for managing user-related operations within the application. The API allows authenticated users to manage their profiles, follow or unfollow other users, view followers and followings, search for users, and manage events and bookings. All endpoints are protected and require authentication via the `ProtectMidll` middleware, ensuring that only authorized users can access the resources.

**Base URL:** `/api/users`


## GET /me

#### Description
This endpoint retrieves the current authenticated user's profile information. The user must be authenticated to access this route.

#### URL
`/api/users/me`

#### Method
`GET`

#### Authentication
This route is protected and requires a valid JWT token. The token should be included in the `Authorization` header as a Bearer token.

#### Response

- **200 OK**: Returns the user's profile information.
  ```json
  {
    "address": {
        "street": "Hay houdan 284",
        "city": "beni mellal",
        "state": "beni mellal khenifra",
        "zip": "25000",
        "country": "Morocco"
    },
    "_id": "66c7ac45f44af4428f9ff29b",
    "firstName": "Oussama",
    "lastName": "ELHADRAOUI",
    "email": "oelhadraoui8@gmail.com",
    "listOfInterest": [
        "Technology",
        "Music",
        "Esport",
        "GYM"
    ],
    "maritalStatus": "Single",
    "tel": "+212641707742",
    "birthDate": "2004-06-20T00:00:00.000Z",
    "notification": true,
    "darkMode": false,
    "emailVerified": true,
    "bio": "Hi, I'm Oussama ELHADRAOUI. \n    You can reach me at oelhadraoui8@gmail.com. \n    I am Single and my contact number is +212641707742. \n    I was born on Sun Jun 20 2004. \n    My interests include Technology, Music, Esport, GYM. \n    My address is Hay houdan 284, beni mellal, beni mellal khenifra, 25000, Morocco.",
    "fullName": "Oussama ELHADRAOUI"
  }
  ```


## GET /:id

#### Description
This endpoint retrieves the profile information of a user by their unique ID. The user must be authenticated to access this route.

#### URL
`/api/users/:id`

#### Method
`GET`

#### URL Parameters
- `id`: The unique identifier of the user you want to retrieve.

#### Authentication
This route is protected and requires a valid JWT token. The token should be included in the `Authorization` header as a Bearer token.

#### Response

- **200 OK**: Returns the requested user's profile information.
  ```json
  {
  
    "address": {
        "street": "Hay houdan 284",
        "city": "beni mellal",
        "state": "beni mellal khenifra",
        "zip": "25000",
        "country": "Morocco"
    },
    "_id": "66c7ac45f44af4428f9ff29b",
    "firstName": "Oussama",
    "lastName": "ELHADRAOUI",
    "email": "oelhadraoui8@gmail.com",
    "listOfInterest": [
        "Technology",
        "Music",
        "Esport",
        "GYM"
    ],
    "maritalStatus": "Single",
    "tel": "+212641707742",
    "birthDate": "2004-06-20T00:00:00.000Z",
    "notification": true,
    "darkMode": false,
    "emailVerified": true,
    "bio": "Hi, I'm Oussama ELHADRAOUI. \n    You can reach me at oelhadraoui8@gmail.com. \n    I am Single and my contact number is +212641707742. \n    I was born on Sun Jun 20 2004. \n    My interests include Technology, Music, Esport, GYM. \n    My address is Hay houdan 284, beni mellal, beni mellal khenifra, 25000, Morocco.",
    "fullName": "Oussama ELHADRAOUI"
  }
  ```


## PUT /me

#### Description
This endpoint allows authenticated users to update their profile information, including uploading a profile picture. The user must be authenticated to access this route.

#### URL
`/api/users/me`

#### Method
`PUT`

#### Authentication
This route is protected and requires a valid JWT token. The token should be included in the `Authorization` header as a Bearer token.

#### Request Body

- **firstName** (optional, string): The user's first name.
- **lastName** (optional, string): The user's last name.
- **tel** (optional, string): The user's telephone number.
- **birthDate** (optional, string, ISO 8601): The user's birth date.
- **bio** (optional, string, max length 500): The user's bio.
- **address** (optional, object): The user's address, including fields such as `street`, `city`, `state`, `zip`, and `country`.
- **listOfInterest** (optional, array of strings): The user's list of interests.
- **maritalStatus** (optional, string): The user's marital status (`Married`, `Single`, `Prefer not to say`, `Other`).
- **notification** (optional, boolean): Whether the user wants to receive notifications.
- **darkMode** (optional, boolean): Whether the user has enabled dark mode.

#### File Upload
- **profilePicture** (optional, file): A profile picture to upload. Allowed file types are `image/jpeg`, `image/png`, and `image/gif`.

#### Example Request
```bash
curl -X PUT -H "Authorization: Bearer <your_token>"
-F "firstName=John"
-F "lastName=Doe" 
-F "profilePicture=@/path/to/picture.jpg" https://localhost:5000/api/users/me
```

#### Response

- **200 OK**: Returns the requested user's profile information.
  ```json
  {
  "_id": "64d8c4d8f6a6e2b8d7e3c9d6",
  "firstName": "John",
  "lastName": "Doe",
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "gender": "Male",
  "listOfInterest": ["coding", "gaming"],
  "maritalStatus": "Single",
  "tel": "+1234567890",
  "birthDate": "1990-01-01T00:00:00.000Z",
  "notification": true,
  "darkMode": false,
  "emailVerified": true,
  "followers": [],
  "following": [],
  "profilePicture": "/tmp/event-app/profiles/64d8c4d8f6a6e2b8d7e3c9d6.jpg",
  "bio": "Hi, I'm John Doe. I love coding and gaming.",
  "address": {
    "street": "123 Main St",
    "city": "Springfield",
    "state": "IL",
    "zip": "62701",
    "country": "USA"
  },
  "createdEvents": [],
  "bookedTickets": [],
  "createdAt": "2024-07-10T11:00:00.000Z",
  "updatedAt": "2024-08-18T12:00:00.000Z"
  }
  ```

- **400 Bad Request** : If there are validation errors or if the user ID is not found in the request.

```json
{
  "errors": [
    {
      "msg": "First name must be a string",
      "param": "firstName",
      "location": "body"
    }
  ]
}
```


- **404 Not Found** : If the user is not found.
```json
{
  "message": "User not found"
}
```

## POST /follow

#### Description
This endpoint allows an authenticated user to follow another user. The user must be authenticated to access this route.

#### URL
`/api/users/follow`

#### Method
`POST`

#### Authentication
This route is protected and requires a valid JWT token. The token should be included in the `Authorization` header as a Bearer token.

#### Request Body

- **targetUserId** (required, string): The ID of the user that the authenticated user wants to follow.

#### Example Request
```bash
curl -X POST -H "Authorization: Bearer <your_token>" 
-H "Content-Type: application/json" 
-d '{"targetUserId": "64d8c4d8f6a6e2b8d7e3c9d7"}'
https://localhost:5000/api/users/follow
```

- **200 OK**: Returns a success message if the follow action was successful.

```json
{
  "message": "Successfully followed the user"
}
```

- **400 Bad Request**: If the user attempts to follow themselves or if they are already following the target user.

```json
{
  "message": "You cannot follow yourself"
}
```

```json
{
  "message": "You are already following this user"
}
```

- **404 Not Found**: If the current user or the target user is not found.

```json
{
  "message": "User not found"
}
```

### Example Use Case
- User A wants to follow User B.
- User A sends a POST request to the /api/users/follow endpoint with the targetUserId of User B.
- The server checks if User A is not trying to follow themselves and if they are not already following User B.
- If the checks pass, User A is added to the followers list of User B, and User B is added to the following list of User A.
- The server responds with a success message.

## POST /unfollow

#### Description
This endpoint allows an authenticated user to unfollow another user. The user must be authenticated to access this route.

#### URL
`/api/users/unfollow`

#### Method
`POST`

#### Authentication
This route is protected and requires a valid JWT token. The token should be included in the `Authorization` header as a Bearer token.

#### Request Body

- **targetUserId** (required, string): The ID of the user that the authenticated user wants to unfollow.


#### Example Request
```bash
curl -X POST -H "Authorization: Bearer <your_token>" 
-H "Content-Type: application/json" 
-d '{"targetUserId": "64d8c4d8f6a6e2b8d7e3c9d7"}'
https://localhost:5000/api/users/unfollow
```

- **200 OK**: Returns a success message if the follow action was successful.

```json
{
  "message": "Successfully unfollowed the user"
}
```

- **400 Bad Request**: If the user attempts to follow themselves or if they are already following the target user.

```json
{
  "message": "You cannot unfollow yourself"
}
```

```json
{
  "message": "You are not following this user"
}
```

- **404 Not Found**: If the current user or the target user is not found.

```json
{
  "message": "User not found"
}
```

### Example Use Case
- User A wants to follow User B.
- User A sends a POST request to the /api/users/follow endpoint with the targetUserId of User B.
- The server checks if User A is not trying to follow themselves and if they are not already following User B.
- If the checks pass, User A is added to the followers list of User B, and User B is added to the following list of User A.
- The server responds with a success message.


## GET /followers

#### Description
This endpoint retrieves a list of followers for the authenticated user. The user must be authenticated to access this route.

#### URL
`/api/users/followers`

#### Method
`GET`

#### Authentication
This route is protected and requires a valid JWT token. The token should be included in the `Authorization` header as a Bearer token.

#### Request Parameters
None.

#### Example Request
```bash
curl -X GET -H "Authorization: Bearer <your_token>" https://localhost:5000/api/users/followers
```

- **200 OK**: Returns a list of the authenticated user's followers.

```json
[
  {
    "_id": "64d8c4d8f6a6e2b8d7e3c9d7",
    "firstName": "John",
    "lastName": "Doe",
    "email": "johndoe@example.com",
    "profilePicture": "/path/to/profile/picture.jpg",
    // Other fields as per your User schema
  },
  {
    "_id": "64d8c4d8f6a6e2b8d7e3c9d8",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "janesmith@example.com",
    "profilePicture": "/path/to/profile/picture.jpg",
    // Other fields as per your User schema
  }
]
```

- **404 Not Found**: If the user is not found in the database.

```json 
{
  "message": "User not found"
}
```

#### Example Use Case
 - User A wants to view their list of followers.
 - User A sends a GET request to the /api/users/followers endpoint.
 - The server retrieves the list of users who follow User A.
 - The server responds with a list of follower objects.


## GET /followings

#### Description
This endpoint retrieves a list of users whom the authenticated user is following. The user must be authenticated to access this route.

#### URL
`/api/users/followings`

#### Method
`GET`

#### Authentication
This route is protected and requires a valid JWT token. The token should be included in the `Authorization` header as a Bearer token.

#### Request Parameters
None.

#### Example Request
```bash
curl -X GET -H "Authorization: Bearer <your_token>" https://localhost:5000/api/users/followings
```

- **200 OK**: Returns a list of the authenticated user's followers.

```json
[
  {
    "_id": "64d8c4d8f6a6e2b8d7e3c9d7",
    "firstName": "Alice",
    "lastName": "Johnson",
    "email": "alicejohnson@example.com",
    "profilePicture": "/path/to/profile/picture.jpg",
    // Other fields as per your User schema
  },
  {
    "_id": "64d8c4d8f6a6e2b8d7e3c9d8",
    "firstName": "Bob",
    "lastName": "Williams",
    "email": "bobwilliams@example.com",
    "profilePicture": "/path/to/profile/picture.jpg",
    // Other fields as per your User schema
  }
]
```

- **404 Not Found**: If the user is not found in the database.

```json 
{
  "message": "User not found"
}
```


## GET /search

#### Description
This endpoint allows authenticated users to search for other users based on their first name, last name, or interests. The search results support pagination and return relevant user information.

#### URL
`/api/users/search`

#### Method
`GET`

#### Authentication
This route is protected and requires a valid JWT token. The token should be included in the `Authorization` header as a Bearer token.

#### Query Parameters

- **query** (`string`, required): The search term used to find matching users. The term should be at least 3 characters long.
- **page** (`integer`, optional): The page number for pagination. Defaults to `1`.
- **limit** (`integer`, optional): The number of results per page. Defaults to `10`.

#### Example Request
```bash
curl -X GET "https://localhost:5000/api/users/search?query=alice&page=1&limit=10" -H "Authorization: Bearer <your_token>"
```

### Response
 - **200 OK**: Returns a paginated list of users matching the search criteria.

```json

{
  "users": [
    {
      "_id": "64d8c4d8f6a6e2b8d7e3c9d7",
      "firstName": "Alice",
      "lastName": "Johnson",
      "email": "alicejohnson@example.com",
      "profilePicture": "/path/to/profile/picture.jpg",
      // Other fields as per your User schema
    },
    {
      "_id": "64d8c4d8f6a6e2b8d7e3c9d8",
      "firstName": "Alice",
      "lastName": "Smith",
      "email": "alicesmith@example.com",
      "profilePicture": "/path/to/profile/picture.jpg",
      // Other fields as per your User schema
    }
  ],
  "totalUsers": 25,
  "currentPage": 1,
  "totalPages": 3
}
```

### Example Use Case
 - User C wants to search for users with the name "Alice" or who have "coding" in their interests.
 - User C sends a GET request to the /api/users/search endpoint with the query parameters query=alice and page=1&limit=10.
 - The server searches for users matching the query and returns a paginated list of users along with the total number of users found, current page, and total pages.

### Notes
 - The search is case-insensitive and matches users based on the query term in their first name, last name, or list of interests.
 - Pagination helps manage large result sets and improves performance.



## GET /events

#### Description
This endpoint retrieves the events created by the authenticated user. The results can be filtered and sorted based on various criteria, and pagination is supported.

#### URL
`/api/users/events`

#### Method
`GET`

#### Authentication
This route is protected and requires a valid JWT token. The token should be included in the `Authorization` header as a Bearer token.

#### Query Parameters

- **filterBy** (`object`, optional): Object containing filters for the event search. The available filters are:
  - **title** (`string`): Filter events by title.
  - **startDate** (`string`): Filter events by start date (ISO 8601 format).
  - **endDate** (`string`): Filter events by end date (ISO 8601 format).
  - **location** (`string`): Filter events by location city.
  - **categories** (`string`): Filter events by categories (comma-separated list).

- **sortBy** (`object`, optional): Object containing sorting criteria. The available sorting is by:
  - **date** (`string`): Sort events by date. Possible values are 'ASC' for ascending and 'DESC' for descending.

- **limit** (`integer`, optional): The number of events per page. Defaults to `10`.

- **page** (`integer`, optional): The page number for pagination. Defaults to `1`.

#### Example Request
```bash
curl -X GET "https://yourdomain.com/api/users/events?filterBy[title]=conference&filterBy[startDate]=2024-01-01&filterBy[endDate]=2024-12-31&sortBy[date]=ASC&limit=5&page=2"
-H "Authorization: Bearer <your_token>"
```

- **200 OK**: Returns the list of events matching the criteria along with pagination information 
```json
{
  "events": [
    {
      "_id": "64d8c4d8f6a6e2b8d7e3c9d7",
      "title": "Tech Conference 2024",
      "date": "2024-06-15T09:00:00Z",
      "location": { "city": "New York" },
      "categories": ["Technology", "Conference"]
      // Other event fields
    },
    // More events
  ],
  "pagination": {
    "currentPage": 2,
    "totalPages": 5,
    "totalEvents": 45
  }
}
```

- **404 Not Found**: If the user is not found.
```json
{
  "status": "error",
  "message": "User not found"
}
```

### Example Use Case

 - User D wants to retrieve their events that match the title "conference", are scheduled between January 1, 2024, and December 31, 2024, are located in "New York", and fall under the categories "Technology" and "Conference". They want the results sorted by date in ascending order, with 5 events per page, and they are on page 2 of the results.
 - User D sends a GET request to the /api/users/events endpoint with the appropriate query parameters.
 - The server retrieves the filtered, sorted, and paginated events and returns them in the response.

### Notes
 - The filterBy and sortBy parameters should be provided as query string objects.
 - Pagination helps manage large result sets and improve performance by only returning a subset of the data.



## GET /bookings

#### Description
This endpoint retrieves the bookings made by the authenticated user. Results can be filtered and sorted based on various criteria, and pagination is supported.

#### URL
`/api/users/bookings`

#### Method
`GET`

#### Authentication
This route is protected and requires a valid JWT token. The token should be included in the `Authorization` header as a Bearer token.

#### Query Parameters

- **filterBy** (`object`, optional): Object containing filters for the booking search. The available filters are:
  - **status** (`string`): Filter bookings by status. Valid values are 'Booked', 'Cancelled', and 'Refunded'.
  - **ticketType** (`string`): Filter bookings by ticket type. Valid values are 'Standard' and 'VIP'.

- **sortBy** (`object`, optional): Object containing sorting criteria. The available sorting options are:
  - **date** (`string`): Sort bookings by event date. Possible values are 'ASC' for ascending and 'DESC' for descending.
  - **purchaseDate** (`string`): Sort bookings by purchase date. Possible values are 'ASC' for ascending and 'DESC' for descending.
  - **price** (`string`): Sort bookings by price. Possible values are 'ASC' for ascending and 'DESC' for descending.

- **page** (`integer`, optional): The page number for pagination. Defaults to `1`.

- **limit** (`integer`, optional): The number of bookings per page. Defaults to `10`.

#### Example Request
```bash
curl -X GET "https://yourdomain.com/api/users/bookings?filterBy[status]=Booked&filterBy[ticketType]=VIP&sortBy[date]=ASC&limit=5&page=2"
-H "Authorization: Bearer <your_token>"
```

### Response

- **200 OK**: Returns the list of bookings matching the criteria along with pagination information.

```json
{
  "bookings": [
    {
      "_id": "64d8c4d8f6a6e2b8d7e3c9d7",
      "event": {
        "_id": "64d8c4d8f6a6e2b8d7e3c9d7",
        "title": "Tech Conference 2024",
        "date": "2024-06-15T09:00:00Z"
        // Other event fields
      },
      "status": "Booked",
      "ticketType": "VIP",
      "purchaseDate": "2024-01-10T12:00:00Z",
      "price": 150
      // Other booking fields
    }
    // More bookings
  ],
  "pagination": {
    "page": 2,
    "totalPages": 5,
    "totalBookings": 45
  }
}
```

- **400 Bad Request**: If the provided filter values are invalid.

```json
{
  "status": "error",
  "message": "Invalid Booking Status" // or "Invalid Ticket Type"
}
```

- **404 Not Found**: If the user is not found

```json
{
  "status": "error",
  "message": "User not found"
}
```

### Example Use Case

 - User E wants to retrieve their bookings filtered by status "Booked", with ticket type "VIP", and sorted by event date in ascending order. They want to see 5 bookings per page and are currently on page 2 of the results.
 - User E sends a GET request to the /api/users/bookings endpoint with the appropriate query        parameters.
 - The server retrieves the filtered, sorted, and paginated bookings and returns them in the respons.

