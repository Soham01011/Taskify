
# Task API: Schedule Recurrence (`POST /api/tasks`)

The `schedule` recurrence type is designed for multi-day events or scheduled programs (e.g. an event next week spanning 5 days at 5 PM every day). 

Dates and daily times are sent as standard **ISO 8601 UTC date-time strings** (e.g., `"2026-10-20T17:00:00.000Z"`). The backend calculates each calendar day between `startDate` and `endDate` while preserving the exact scheduled time, and **bulk creates normal simple tasks** (`recurrence: { frequency: "none" }`) with the same title, description, time slots, and subtasks using MongoDB `insertMany()` in a single operation.

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
| `dueDate` | `String` (ISO 8601) | Yes* | **Start date and time** for the task (e.g. `"2026-10-20T17:00:00.000Z"`). This sets the daily event start time (5:00 PM) used for alarms and notifications. *(Can also be provided as `recurrence.startDate`)*. |
| `timeSlots` / `timeSlot` | `Array` \| `Object` \| `Number` | No | Duration of the task (e.g. `{ hours: 1, minutes: 30 }`, `90` minutes, or `[{ hours: 1, minutes: 30 }]`). Indicates how long the task takes from the start time. Defaults to 30 minutes. |
| `alarm_type` | `String` | No | Alarm type for reminders (e.g., `"notification"`, `"alarm"`). |
| `alarm_reminder_time` | `String` (ISO 8601) | No | Notification reminder time (e.g., `"2026-10-20T16:45:00.000Z"`). The offset before the start time (e.g. 15 minutes prior) is preserved for every day in the schedule. |
| `recurrence` | `Object` | Yes | Recurrence configuration object: |
| `recurrence.frequency` | `String` | Yes | Set to `"schedule"` (or `"scheduled"`). |
| `recurrence.startDate` | `String` (ISO 8601) | No | Schedule start date-time (defaults to `dueDate`). |
| `recurrence.endDate` | `String` (ISO 8601) | Yes | Schedule end date-time (e.g., `"2026-10-24T17:00:00.000Z"`). |
| `subtasks` | `Array<Object>` | No | Subtasks to include in each scheduled day's task `[{ title: "Step 1" }]`. |

### Example Request Body (5-Day Event starting at 5:00 PM with 15-min Reminder)
```json
{
  "title": "Annual Tech Conference",
  "description": "5-day daily sessions and keynote presentations",
  "dueDate": "2026-10-20T17:00:00.000Z",
  "timeSlot": { "hours": 1, "minutes": 30 },
  "alarm_type": "push",
  "alarm_reminder_time": "2026-10-20T16:45:00.000Z",
  "recurrence": {
    "frequency": "schedule",
    "startDate": "2026-10-20T17:00:00.000Z",
    "endDate": "2026-10-24T17:00:00.000Z"
  },
  "subtasks": [
    { "title": "Review session agenda" }
  ]
}
```

### Response (`201 Created`)
Returns an array of all 5 created **normal tasks** (`recurrence: { frequency: "none" }`) created in bulk:
```json
[
  {
    "_id": "670c2a8f8e1234567890abcd",
    "userId": "user_123",
    "title": "Annual Tech Conference",
    "description": "5-day daily sessions and keynote presentations",
    "dueDate": "2026-10-20T17:00:00.000Z",
    "alarm_type": "push",
    "alarm_reminder_time": "2026-10-20T16:45:00.000Z",
    "timeSlots": [{ "hours": 1, "minutes": 30 }],
    "subtasks": [{ "title": "Review session agenda", "completed": false }],
    "recurrence": {
      "frequency": "none"
    },
    "completed": false,
    "syncSent": true,
    "created_at": "2026-10-22T20:00:00.000Z",
    "updated_at": "2026-10-22T20:00:00.000Z"
  },
  {
    "_id": "670c2a8f8e1234567890abce",
    "userId": "user_123",
    "title": "Annual Tech Conference",
    "description": "5-day daily sessions and keynote presentations",
    "dueDate": "2026-10-21T17:00:00.000Z",
    "alarm_type": "push",
    "alarm_reminder_time": "2026-10-21T16:45:00.000Z",
    "timeSlots": [{ "hours": 1, "minutes": 30 }],
    "subtasks": [{ "title": "Review session agenda", "completed": false }],
    "recurrence": {
      "frequency": "none"
    },
    "completed": false,
    "syncSent": true,
    "created_at": "2026-10-22T20:00:00.000Z",
    "updated_at": "2026-10-22T20:00:00.000Z"
  }
  // ... remaining 3 normal tasks for Oct 22, Oct 23, and Oct 24 (each with alarm at 16:45:00.000Z on that day)
]
```

### Error Responses (`400 Bad Request`)
- Missing parameters: `{"error": "startDate and endDate are required for schedule recurrence"}`
- Invalid date ordering: `{"error": "endDate cannot be before startDate"}`
- Start in past: `{"error": "startDate/time cannot be in the past"}`


