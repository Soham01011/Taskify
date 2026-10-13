
# Task API: Schedule Recurrence (`POST /api/tasks`)

The `schedule` recurrence type is designed for multi-day events or scheduled programs (e.g. an event next week spanning 5 days at 5 PM every day). Creating a task with this recurrence generates distinct task documents for every day in the range.

## Request Information

- **Endpoint**: `POST /api/tasks`
- **Method**: `POST`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <your_jwt_token>`

## Request Body Parameters for Schedule Recurrence

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `title` | `String` | Yes | Title of the task / event. |
| `description` | `String` | No | Description of the task. |
| `recurrence` | `Object` | Yes | Recurrence configuration object: |
| `recurrence.frequency` | `String` | Yes | Set to `"schedule"` (or `"scheduled"`). |
| `recurrence.startDate` | `String` | Yes | Start date of the schedule (e.g., `"2026-10-20"` or ISO string). |
| `recurrence.endDate` | `String` | Yes | End date of the schedule (e.g., `"2026-10-24"` or ISO string). |
| `recurrence.time` | `String` | No | Time of the task (e.g., `"17:00"` or `"5 PM"`). Defaults to start date time or `12:00 AM`. |
| `timeSlots` / `timeSlot` | `Array` \| `Object` \| `Number` | No | Optional time slot duration. Can be `{ hours: 1, minutes: 0 }`, `45` (minutes), or `[{ hours: 0, minutes: 30 }]`. Defaults to 30 minutes. |
| `subtasks` | `Array<Object>` | No | Subtasks to include in each scheduled day's task `[{ title: "Step 1" }]`. |

### Example Request Body (5-Day Event at 5 PM)
```json
{
  "title": "Annual Tech Conference",
  "description": "5-day daily sessions and keynote presentations",
  "recurrence": {
    "frequency": "schedule",
    "startDate": "2026-10-20",
    "endDate": "2026-10-24",
    "time": "5 PM",
    "timeSlot": { "hours": 1, "minutes": 30 }
  },
  "subtasks": [
    { "title": "Review session agenda" }
  ]
}
```

### Response (`201 Created`)
Returns an array of all 5 created task documents (linked via `originTaskId`):
```json
[
  {
    "_id": "670c2a8f8e1234567890abcd",
    "userId": "user_123",
    "title": "Annual Tech Conference",
    "dueDate": "2026-10-20T17:00:00.000Z",
    "timeSlots": [{ "hours": 1, "minutes": 30 }],
    "recurrence": {
      "frequency": "schedule",
      "startDate": "2026-10-20T00:00:00.000Z",
      "endDate": "2026-10-24T00:00:00.000Z",
      "time": "5 PM",
      "originTaskId": "670c2a8f8e1234567890abcd"
    },
    "completed": false
  },
  {
    "_id": "670c2a8f8e1234567890abce",
    "userId": "user_123",
    "title": "Annual Tech Conference",
    "dueDate": "2026-10-21T17:00:00.000Z",
    "timeSlots": [{ "hours": 1, "minutes": 30 }],
    "recurrence": {
      "frequency": "schedule",
      "startDate": "2026-10-20T00:00:00.000Z",
      "endDate": "2026-10-24T00:00:00.000Z",
      "time": "5 PM",
      "originTaskId": "670c2a8f8e1234567890abcd"
    },
    "completed": false
  }
  // ... remaining 3 tasks for Oct 22, Oct 23, and Oct 24
]
```

### Error Responses (`400 Bad Request`)
- Missing parameters: `{"error": "startDate and endDate are required for schedule recurrence"}`
- Invalid date ordering: `{"error": "endDate cannot be before startDate"}`
- Start in past: `{"error": "startDate cannot be in the past"}`

