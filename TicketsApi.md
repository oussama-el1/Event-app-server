## Ticket Purchase API

**Base URL:** `http://localhost:5000/api/tickets`

### POST /purchase

**Description:**  
This endpoint allows a user to purchase tickets for an event. The user must be authenticated, and the request must include valid event and ticket information.

**Request:**

- **Method:** `POST`
- **URL:** `/purchase`

**Headers:**

- `Authorization: Bearer <token>`  
  _(Required)_ - The token to authenticate the user.

**Body Parameters:**

| Parameter    | Type   | Description                                                                          |
|--------------|--------|--------------------------------------------------------------------------------------|
| `event`      | String | **Required.** The MongoDB ID of the event for which tickets are being purchased.     |
| `ticketType` | String | **Required.** The type of ticket. Allowed values: `Standard`, `VIP`.                 |
| `quantity`   | Number | **Required.** The number of tickets to purchase. Must be at least `1`.               |

**Validation:**

- `event`: Must be a valid MongoDB ID.
- `ticketType`: Must be either `Standard` or `VIP`.
- `quantity`: Must be an integer with a minimum value of 1.

**Responses:**

- **201 Created**
  - **Description:** Tickets purchased successfully.
  - **Response Body:**
    ```json
    {
      "message": "Tickets purchased successfully",
      "tickets": [
        {
          "bookingId": "string",
          "event": "string",
          "user": "string",
          "ticketType": "string",
          "seatNumber": "string",
          "price": number,
          "quantity": 1,
          "qrCode": "string"
        }
        // additional tickets...
      ],
      "remainingTickets": number
    }
    ```

- **400 Bad Request**
  - **Description:** The request contains invalid data.
  - **Response Body:**
    ```json
    {
      "errors": [
        {
          "msg": "string",
          "param": "string",
          "location": "string"
        }
        // additional errors...
      ]
    }
    ```

- **404 Not Found**
  - **Description:** Either the user or the event could not be found.
  - **Response Body:**
    ```json
    {
      "message": "User not found" | "Event not found"
    }
    ```

- **409 Conflict**
  - **Description:** The event is sold out, or there aren't enough available seats.
  - **Response Body:**
    ```json
    {
      "message": "This event is sold out" | "Not enough seats available"
    }
    ```

- **500 Internal Server Error**
  - **Description:** An error occurred on the server.
  - **Response Body:**
    ```json
    {
      "message": "string"
    }
    ```

**Middleware Used:**

- `ProtectMidll`: Ensures the user is authenticated before accessing the route.
- `validateTicketPurchase`: Validates the request body for the necessary parameters and their format.

## Get Ticket Details API

**Base URL:** `http://localhost:5000/api/tickets`

### GET /:id

**Description:**  
This endpoint retrieves the details of a specific ticket. The user must be authenticated, and the ticket must belong to the authenticated user.

**Request:**

- **Method:** `GET`
- **URL:** `/:id`

**Headers:**

- `Authorization: Bearer <token>`  
  _(Required)_ - The token to authenticate the user.

**Path Parameters:**

| Parameter | Type   | Description                                    |
|-----------|--------|------------------------------------------------|
| `id`      | String | **Required.** The MongoDB ID of the ticket to retrieve. |

**Responses:**

- **200 OK**
  - **Description:** The ticket details were retrieved successfully.
  - **Response Body:**
    ```json
    {
      "status": "success",
      "ticket": {
        "_id": "string",
        "event": {
          "title": "string",
          "date": "string",
          "location": "string",
          "organizer": "string",
          "media": "string"
        },
        "user": "string",
        "ticketType": "string",
        "seatNumber": "string",
        "price": number,
        "quantity": 1,
        "qrCode": "string"
      }
    }
    ```

- **403 Forbidden**
  - **Description:** The user is not authorized to view this ticket.
  - **Response Body:**
    ```json
    {
      "status": "error",
      "message": "You are not authorized to view this ticket"
    }
    ```

- **404 Not Found**
  - **Description:** Either the user or the ticket could not be found.
  - **Response Body:**
    ```json
    {
      "status": "error",
      "message": "User Not Found" | "Ticket Not Found"
    }
    ```

- **500 Internal Server Error**
  - **Description:** An error occurred on the server.
  - **Response Body:**
    ```json
    {
      "message": "string"
    }
    ```

**Middleware Used:**

- `ProtectMidll`: Ensures the user is authenticated before accessing the route.


## Cancel Ticket API

**Base URL:** `http://localhost:5000/api/tickets`

### POST /:id/cancel

**Description:**  
This endpoint allows a user to cancel a purchased ticket. The user must be authenticated, and the ticket must belong to the authenticated user.

**Request:**

- **Method:** `POST`
- **URL:** `/:id/cancel`

**Headers:**

- `Authorization: Bearer <token>`  
  _(Required)_ - The token to authenticate the user.

**Path Parameters:**

| Parameter | Type   | Description                                    |
|-----------|--------|------------------------------------------------|
| `id`      | String | **Required.** The MongoDB ID of the ticket to cancel. |

**Responses:**

- **200 OK**
  - **Description:** The ticket was successfully cancelled.
  - **Response Body:**
    ```json
    {
      "status": "success",
      "message": "Ticket cancelled successfully"
    }
    ```

- **400 Bad Request**
  - **Description:** The ticket is already cancelled or refunded.
  - **Response Body:**
    ```json
    {
      "status": "error",
      "message": "Ticket is already cancelled or refunded"
    }
    ```

- **403 Forbidden**
  - **Description:** The user is not authorized to cancel this ticket.
  - **Response Body:**
    ```json
    {
      "status": "error",
      "message": "You are not authorized to cancel this ticket"
    }
    ```

- **404 Not Found**
  - **Description:** Either the user or the ticket could not be found.
  - **Response Body:**
    ```json
    {
      "status": "error",
      "message": "User Not Found" | "Ticket Not Found"
    }
    ```

- **500 Internal Server Error**
  - **Description:** An error occurred on the server.
  - **Response Body:**
    ```json
    {
      "status": "error",
      "message": "string"
    }
    ```

**Middleware Used:**

- `ProtectMidll`: Ensures the user is authenticated before accessing the route.
