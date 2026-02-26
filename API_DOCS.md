# Taskify API Documentation

This documentation covers the API endpoints for the Taskify Monolithic Backend.

**Base URL:** `http://localhost:3000`

---

## Authentication

All protected routes require a Bearer token in the `Authorization` header:
`Authorization: Bearer <your_access_token>`

### 1. Register
- **URL:** `/api/auth/register`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "username": "johndoe",
    "password": "securepassword123"
  }
  ```
- **Success Response:** `201 Created`

### 2. Login
- **URL:** `/api/auth/login`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "username": "johndoe",
    "password": "securepassword123"
  }
  ```
- **Success Response:** `200 OK` (returns `accessToken` and `refreshToken`)

### 3. Verify Token
- **URL:** `/api/auth/verify`
- **Method:** `POST`
- **Body:** `{ "token": "<token>" }`
- **Success Response:** `200 OK`
- **Sample Body:**
  ```json
  {
    "valid": true
  }
  ```
- **Error Response:** `401 Unauthorized`
- **Sample Body:**
```json
{
  "error": "Token verification failed"
}
```
- **Error Response:** `401 Unauthorized`
- **Sample Body:**
```json
{
  "error": "Token expired",
  "code": "TOKEN_EXPIRED"
}
```

### 4. Refresh Token
- **URL:** `/api/auth/refresh`
- **Method:** `POST`
- **Body:** `{ "refreshToken": "<token>" }`
- **Success Response:** `200 OK`
- **Sample Body:**
  ```json
  {
    "accessToken": "<new_access_token>",
    "refreshToken": "<new_refresh_token>",
    "userId": "<user_id>"
  }
  ```
- **Error Response:** `401 Unauthorized`
- **Sample Body:**
  ```json
  {
    "error": "Invalid refresh token"
  }
  ```

---

## Tasks

### 1. Create Task
- **URL:** `/api/tasks`
- **Method:** `POST`
- **Auth Required:** Yes
- **Body:**
  ```json
  {
    "title": "Buy groceries",
    "description": "Milk, Eggs, Bread",
    "dueDate": "2026-02-01T10:00:00Z",
    "subtasks": [
      { "title": "Milk", "dueDate": "2026-02-01T09:00:00Z" }
    ],
    "created_at": "2026-02-01T10:00:00Z",
    "updated_at": "2026-02-01T10:00:00Z"
  }
  ```

### 2. Get All Tasks
- **URL:** `/api/tasks`
- **Method:** `GET`
- **Auth Required:** Yes
- **Query Parameters (Optional):**
  - `pageNumber` (number): The page number to retrieve.
  - `pageSize` (number): Number of tasks per page.
  - `created_at` (string, ISO 8601): Fetch tasks created after this timestamp.
- **Success Response:** `200 OK`
- **Response Format:**
  - **Standard (no pagination):** Returns a flat array of task objects.
    ```json
    [ { ... }, { ... } ]
    ```
  - **Paginated (if `pageNumber` & `pageSize` are sent):** Returns a structured object.
    ```json
    {
      "tasks": [ { ... } ],
      "pagination": {
        "totalTasks": 100,
        "currentPage": 1,
        "pageSize": 10,
        "totalPages": 10
      }
    }
    ```
- **Sample Body:**
  ```json
  [
    {
      "_id": "65b9a8...",
      "userId": "65b9a7...",
      "title": "Buy groceries",
      "description": "Milk, Eggs, Bread",
      "completed": false,
      "dueDate": "2026-02-01T10:00:00.000Z",
      "subtasks": [
        {
          "title": "Milk",
          "completed": false,
          "dueDate": "2026-02-01T09:00:00.000Z",
          "_id": "65b9a9..."
        }
      ],
      "created_at": "2026-02-09T10:00:00.000Z",
      "updated_at": "2026-02-09T11:00:00.000Z",
      "__v": 0
    }
  ]
  ```

### 3. Update Task
- **URL:** `/api/tasks/:id`
- **Method:** `PUT`
- **Auth Required:** Yes
- **Body:** Same as Create Task (partial updates allowed).

### 4. Complete Task
- **URL:** `/api/tasks/:id/complete`
- **Method:** `PATCH`
- **Auth Required:** Yes

### 5. Add Subtask
- **URL:** `/api/tasks/:id/subtasks`
- **Method:** `POST`
- **Auth Required:** Yes
- **Body:** `{ "title": "Eggs", "dueDate": "..." }`

### 6. Update Subtask
- **URL:** `/api/tasks/:taskId/subtasks/:subtaskId`
- **Method:** `PUT`
- **Auth Required:** Yes

### 7. Delete Task
- **URL:** `/api/tasks/:id`
- **Method:** `DELETE`
- **Auth Required:** Yes
- **Response:** `200 OK`


### 8. Delete Subtask
- **URL:** `/api/tasks/:taskId/subtasks/:subtaskId`
- **Method:** `DELETE`
- **Auth Required:** Yes
- **Response:** `200 OK`
- **Sample Body:**
  ```json
  {
    "_id": "65b9a8...",
    "userId": "65b9a7...",
    "title": "Buy groceries",
    "description": "Milk, Eggs, Bread",
    "completed": false,
    "dueDate": "2026-02-01T10:00:00.000Z",
    "subtasks": [
      {
        "title": "Milk",
        "completed": false,
        "dueDate": "2026-02-01T09:00:00.000Z",
        "_id": "65b9a9..."
      }
    ],
    "created_at": "2026-02-09T10:00:00.000Z",
    "updated_at": "2026-02-09T11:00:00.000Z",
    "__v": 0
  }
  ```


---

## Groups

### 1. Create Group
- **URL:** `/api/groups`
- **Method:** `POST`
- **Auth Required:** Yes
- **Body:**
  ```json
  {
    "name": "Project Alpha",
    "description": "Backend development team",
    "members": ["userId1", "userId2"]
  }
  ```
- **Success Response:** `201 Created`
- **Sample Response:**
  ```json
  {
    "_id": "65b9c2...",
    "name": "Project Alpha",
    "description": "Backend development team",
    "adminId": { "_id": "65b9a7...", "username": "adminUser" },
    "members": [
      { "_id": "65b9a7...", "username": "userId1" },
      { "_id": "65b9b3...", "username": "userId2" }
    ],
    "tasks": [],
    "__v": 0
  }
  ```

### 2. Get All Groups
- **URL:** `/api/groups`
- **Method:** `GET`
- **Auth Required:** Yes
- **Success Response:** `200 OK`
- **Sample Response:**
  ```json
  [
    {
      "_id": "65b9c2...",
      "name": "Project Alpha",
      "description": "Backend development team",
      "adminId": { "_id": "65b9a7...", "username": "adminUser" },
      "members": [
        { "_id": "65b9a7...", "username": "userId1" }
      ],
      "tasks": [
        {
          "_id": "65b9d4...",
          "groupId": "65b9c2...",
          "userId": { "_id": "65b9b3...", "username": "targetUser" },
          "username": "targetUser",
          "task": "Implement Auth",
          "duedate": "2026-02-10T00:00:00.000Z",
          "completed": false,
          "__v": 0
        }
      ],
      "__v": 0
    }
  ]
  ```

### 3. Assign Task to Group Member
- **URL:** `/api/groups/:groupId/tasks`
- **Method:** `POST`
- **Auth Required:** Yes (Admin or Group Member)
- **Body:**
  ```json
  {
    "userId": "TargetUserID",
    "username": "TargetUsername",
    "task": "Implement Auth",
    "duedate": "2026-02-10"
  }
  ```
- **Note:** `userId`, `username`, and `duedate` are optional.
- **Success Response:** returns updated group object (same format as Get Group Details)

### 4. Update Group Task
- **URL:** `/api/groups/:groupId/tasks/:taskId`
- **Method:** `PUT`
- **Auth Required:** Yes (Admin only)
- **Body:**
  ```json
  {
    "userId": "TargetUserID",
    "username": "TargetUsername",
    "task": "Implement Auth Update",
    "duedate": "2026-02-15",
    "completed": true
  }
  ```
- **Success Response:** `200 OK`

### 5. Add Member to Group
- **URL:** `/api/groups/:groupId/members`
- **Method:** `POST`
- **Auth Required:** Yes (Admin only)
- **Body:** `{ "userId": "..." }`
- **Success Response:** returns updated group object (same format as Get Group Details)

### 6. Remove Member
- **URL:** `/api/groups/:groupId/members/:userId`
- **Method:** `DELETE`
- **Auth Required:** Yes (Admin only)
- **Success Response:** returns updated group object (same format as Get Group Details)

### 7. Delete Group
- **URL:** `/api/groups/:groupId`
- **Method:** `DELETE`
- **Auth Required:** Yes (Admin only)
- **Success Response:** `200 OK`
- **Sample Body:**
  ```json
  {
    "message": "Group deleted"
  }
  ```

### 8. Get Group Details
- **URL:** `/api/groups/:groupId`
- **Method:** `GET`
- **Auth Required:** Yes
- **Success Response:** `200 OK`
- **Sample Body:**
  ```json
  {
    "_id": "65b9c2...",
    "name": "Project Alpha",
    "description": "Backend development team",
    "adminId": { "_id": "65b9a7...", "username": "adminUser" },
    "members": [
      { "_id": "65b9a7...", "username": "userId1" },
      { "_id": "65b9b3...", "username": "userId2" }
    ],
    "tasks": [
      {
        "_id": "65b9d4...",
        "groupId": "65b9c2...",
        "userId": { "_id": "65b9b3...", "username": "targetUser" },
        "username": "targetUser",
        "task": "Implement Auth",
        "duedate": "2026-02-10T00:00:00.000Z",
        "completed": false,
        "__v": 0
      }
    ],
    "__v": 0
  }
  ```

### 9. Fetch Group Members
- **URL:** `/api/groups/:groupId/members`
- **Method:** `GET`
- **Auth Required:** Yes
- **Success Response:** `200 OK` (Array of Member Objects)
- **Sample Body:**
  ```json
  [
    { "_id": "65b9a7...", "username": "userId1" },
    { "_id": "65b9b3...", "username": "userId2" }
  ]
  ```

---


## System

### 1. Health/Readiness Check
- **URL:** `/api/readyness` or `/health`
- **Method:** `GET`
- **Public:** Yes
