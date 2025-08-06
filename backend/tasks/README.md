### Taskify Tasks Service

This microservice handles all task-related operations for Taskify. It is designed for a Kubernetes environment and exposes RESTful APIs for managing tasks and subtasks.

---

#### Environment Variables

- `PORT` - Port on which the service runs (default: 3000)
- `MONGO_URI` - MongoDB connection string (default: mongodb://localhost:27017/Taskify)
- `JWT_SECRET` - JWT secret key (required for auth, default: 'your-secret-key')
- `JWT_EXPIRES_IN` - JWT expiry duration (default: 15m)
- `REFRESH_TOKEN_EXPIRES_IN` - Refresh token expiry (default: 7d)

---

#### Health Check

```
/readyness # GET
```
Returns 200 OK if the service and MongoDB are ready, otherwise 500.

---

#### API Endpoints

- **Create Task**
  ```
  /api/tasks # POST
  ```
  Request body:  
  ```json
  {
    "userId": "string",
    "title": "string",
    "description": "string",
    "dueDate": "ISODateString",
    "subtasks": [
      { "title": "string", "dueDate": "ISODateString" }
    ]
  }
  ```
  Response: Created task object.

- **Get Tasks for a User**
  ```
  /api/tasks?userId=USER_ID # GET
  ```
  Returns all tasks for the given user.

- **Update Task**
  ```
  /api/tasks/:id # PUT
  ```
  Request body:  
  ```json
  {
    "title": "string",
    "description": "string",
    "dueDate": "ISODateString",
    "subtasks": [ ... ]
  }
  ```
  Updates the task with the given ID.

- **Mark Task as Completed**
  ```
  /api/tasks/:id/complete # PATCH
  ```
  Marks the task as completed.

- **Add Subtask**
  ```
  /api/tasks/:id/subtasks # POST
  ```
  Request body:  
  ```json
  {
    "title": "string",
    "dueDate": "ISODateString"
  }
  ```
  Adds a subtask to the task.

- **Update Subtask**
  ```
  /api/tasks/:taskId/subtasks/:subtaskId # PUT
  ```
  Request body:  
  ```json
  {
    "title": "string",
    "completed": true,
    "dueDate": "ISODateString"
  }
  ```
  Updates the subtask.

- **Mark Subtask as Completed**
  ```
  /api/tasks/:taskId/subtasks/:subtaskId/complete # PATCH
  ```
  Marks the subtask as completed.

---

#### Status

- `/api/tasks` (GET, POST): To be tested
- `/api/tasks/:id` (PUT): To be tested
- `/api/tasks/:id/complete` (PATCH): To be tested
- `/api/tasks/:id/subtasks` (POST): To be tested
- `/api/tasks/:taskId/subtasks/:subtaskId` (PUT): To be tested
- `/api/tasks/:taskId/subtasks/:subtaskId/complete` (PATCH): To be tested
- `/readyness` (GET): To be tested