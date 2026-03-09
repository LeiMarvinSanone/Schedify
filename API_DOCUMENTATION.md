# Schedify API Documentation

**Base URL:** `https://schedify-be.onrender.com` (or `http://localhost:5000` for local dev)

**Authentication:** All endpoints except `/auth/register` require JWT token in header:
```
Authorization: Bearer <token>
```

---

## **Authentication Endpoints**

### **1. Register User (Student)**
- **Method:** `POST`
- **URL:** `/api/auth/register`
- **Auth:** Not required
- **Role:** Public (defaults to 'student')

**Request Body:**
```json
{
  "name": "Juan Dela Cruz",
  "email": "juan@example.com",
  "password": "password123",
  "idNo": "2021-00001",
  "department": "CICT",
  "course": "BSIT",
  "yearLevel": "1st Year",
  "block": "Block A",
  "expoPushToken": "ExponentPushToken[...]"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Juan Dela Cruz",
    "email": "juan@example.com",
    "idNo": "2021-00001",
    "role": "student",
    "department": "CICT",
    "course": "BSIT",
    "yearLevel": "1st Year",
    "block": "Block A"
  }
}
```

**Error (400):**
```json
{
  "message": "Email already exists" | "ID number already exists" | "Missing required fields"
}
```

---

### **2. Login User (Student/Admin)**
- **Method:** `POST`
- **URL:** `/api/auth/login`
- **Auth:** Not required

**Request Body:**
```json
{
  "email": "juan@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Juan Dela Cruz",
    "email": "juan@example.com",
    "idNo": "2021-00001",
    "role": "student",
    "department": "CICT",
    "course": "BSIT",
    "yearLevel": "1st Year",
    "block": "Block A"
  }
}
```

**Error (404):**
```json
{
  "message": "User not found"
}
```

**Error (400):**
```json
{
  "message": "Invalid credentials"
}
```

---

## **Schedule Endpoints**

### **3. Create Schedule (Admin Only)**
- **Method:** `POST`
- **URL:** `/api/schedules`
- **Auth:** Required (JWT token + `requireAdmin` middleware)
- **Role:** Admin only

**Request Body:**
```json
{
  "type": "Class Schedules",
  "department": "CICT",
  "course": "BSIT",
  "yearLevel": "1st Year",
  "block": "Block A",
  "semester": "1st Semester",
  "tag": "BSIT 1st Year Block A",
  "subjects": [
    {
      "name": "Programming 101",
      "day": "Monday",
      "timeRange": "10:00 AM - 12:00 PM",
      "room": "Room 101",
      "building": "CSB"
    },
    {
      "name": "Data Structures",
      "day": "Wednesday",
      "timeRange": "2:00 PM - 4:00 PM",
      "room": "Room 102",
      "building": "CSB"
    }
  ]
}
```

**Alternative Request (Events):**
```json
{
  "type": "Events",
  "tag": "whole-university",
  "subjects": [
    {
      "name": "Graduation Ceremony",
      "day": "2024-03-20",
      "timeRange": "10:00 AM - 1:00 PM",
      "room": "Main Auditorium",
      "building": "Admin Building"
    }
  ]
}
```

**Response (201):**
```json
{
  "message": "Schedule created successfully",
  "schedule": {
    "_id": "507f1f77bcf86cd799439012",
    "type": "Class Schedules",
    "department": "CICT",
    "course": "BSIT",
    "yearLevel": "1st Year",
    "block": "Block A",
    "semester": "1st Semester",
    "tag": "BSIT 1st Year Block A",
    "subjects": [...],
    "createdBy": "507f1f77bcf86cd799439011",
    "createdAt": "2024-03-09T10:30:00Z",
    "updatedAt": "2024-03-09T10:30:00Z"
  }
}
```

**Error (403):**
```json
{
  "message": "Not authorized: Admin only"
}
```

---

### **4. Get All Schedules (With Search)**
- **Method:** `GET`
- **URL:** `/api/schedules`
- **URL with Search:** `/api/schedules?search=Database`
- **Auth:** Required (JWT token)
- **Role:** Any authenticated user (students see filtered results, admins see all)

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "type": "Class Schedules",
    "department": "CICT",
    "course": "BSIT",
    "yearLevel": "1st Year",
    "block": "Block A",
    "semester": "1st Semester",
    "tag": "BSIT 1st Year Block A",
    "subjects": [
      {
        "name": "Programming 101",
        "day": "Monday",
        "timeRange": "10:00 AM - 12:00 PM",
        "room": "Room 101",
        "building": "CSB"
      }
    ],
    "createdAt": "2024-03-09T10:30:00Z"
  }
]
```

**Query Parameters:**
- `search` (optional): Searches across 10 fields:
  - `type`, `department`, `course`, `yearLevel`, `block`, `semester`, `tag`
  - `subjects.name`, `subjects.day`, `subjects.room`
  - Case-insensitive regex matching

**Filtering Rules (Students Only):**
- Students see schedules where:
  - `tag` = `"whole-university"` OR
  - Schedule matches their department/course/yearLevel/block

**Error (401):**
```json
{
  "message": "Unauthorized: No token provided"
}
```

---

### **5. Get Single Schedule**
- **Method:** `GET`
- **URL:** `/api/schedules/:id`
- **Auth:** Required (JWT token)
- **Role:** Any authenticated user (subject to filtering rules)

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "type": "Class Schedules",
  "department": "CICT",
  "course": "BSIT",
  "yearLevel": "1st Year",
  "block": "Block A",
  "semester": "1st Semester",
  "tag": "BSIT 1st Year Block A",
  "subjects": [...],
  "createdAt": "2024-03-09T10:30:00Z"
}
```

**Error (404):**
```json
{
  "message": "Schedule not found"
}
```

---

### **6. Update Schedule (Admin Only)**
- **Method:** `PUT`
- **URL:** `/api/schedules/:id`
- **Auth:** Required (JWT token + `requireAdmin` middleware)
- **Role:** Admin only

**Request Body (Partial Update Allowed):**
```json
{
  "tag": "BSIT 1st Year Section A",
  "subjects": [
    {
      "name": "Programming 101",
      "day": "Monday",
      "timeRange": "10:00 AM - 12:00 PM",
      "room": "Room 101",
      "building": "CSB"
    }
  ]
}
```

**Response (200):**
```json
{
  "message": "Schedule updated successfully",
  "schedule": {
    "_id": "507f1f77bcf86cd799439012",
    "type": "Class Schedules",
    "department": "CICT",
    "course": "BSIT",
    "yearLevel": "1st Year",
    "block": "Block A",
    "semester": "1st Semester",
    "tag": "BSIT 1st Year Section A",
    "subjects": [...],
    "updatedAt": "2024-03-09T11:15:00Z"
  }
}
```

**Error (403):**
```json
{
  "message": "Not authorized: Admin only"
}
```

**Error (404):**
```json
{
  "message": "Schedule not found"
}
```

---

### **7. Delete Schedule (Admin Only)**
- **Method:** `DELETE`
- **URL:** `/api/schedules/:id`
- **Auth:** Required (JWT token + `requireAdmin` middleware)
- **Role:** Admin only

**Response (200):**
```json
{
  "message": "Schedule deleted successfully"
}
```

**Error (403):**
```json
{
  "message": "Not authorized: Admin only"
}
```

**Error (404):**
```json
{
  "message": "Schedule not found"
}
```

---

## **Authentication Flow**

### **Token Lifetime**
- Tokens expire in **7 days**
- Issued on login/register

### **Token Storage (Frontend)**
- Stored in AsyncStorage with key: `schedify:auth:token:v1`

### **Token Usage (Frontend)**
- Automatically included in all requests via `apiClient.ts`
- Header: `Authorization: Bearer <token>`

### **Role Determination**
- **Backend enforces:** Admin/Student role is stored in database, NOT settable by frontend
- **Frontend enforces:** UI shows different tabs based on returned role
  - Admin: Post, All Schedules, Settings, Welcome
  - Student: Calendar, Events, Profile, Change Password

---

## **Error Codes Reference**

| Code | Meaning | Cause |
|------|---------|-------|
| 200 | OK | Success |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Missing required fields, invalid input |
| 401 | Unauthorized | No token or invalid token |
| 403 | Forbidden | User role lacks permission (not admin) |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Database or server error |

---

## **Field Constraints**

| Field | Type | Required | Options | Example |
|-------|------|----------|---------|---------|
| name | String | Yes | Any string | "Juan Dela Cruz" |
| email | String | Yes | Valid email | "juan@example.com" |
| password | String | Yes | 6+ chars | "password123" |
| idNo | String | Yes | Unique | "2021-00001" |
| department | String | Yes | CICT, CBME | "CICT" |
| course | String | Yes | See below | "BSIT" |
| yearLevel | String | Optional | 1st/2nd/3rd/4th Year | "1st Year" |
| block | String | Optional | Block A/B/C/D | "Block A" |
| type (Schedule) | String | Yes | Class Schedules, Events, Suspension | "Class Schedules" |
| semester | String | Optional | 1st, 2nd, Summer | "1st Semester" |
| tag | String | Yes | Any string or "whole-university" | "BSIT 1st Year Block A" |

**Course Options by Department:**
- CICT: BSIT, BSCS, BSIS, BTVTED
- CBME: BSA, BSAIS, BSE, BPA

---

## **Rate Limiting**
Currently: No rate limiting (can be added for production)

---

## **CORS**
- Frontend: `https://schedify-fe.vercel.com`
- Local Dev: `http://localhost:8081`

