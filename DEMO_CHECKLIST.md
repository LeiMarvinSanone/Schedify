# Demo Presentation Checklist

## **Before You Start**

### **Pre-Demo Setup (30 minutes before)**

- [ ] **Terminal 1**: Backend running
  ```bash
  cd schedify-be/schedify-be
  npm start
  # Should see: Server running on port 5000
  #            MongoDB connected
  ```

- [ ] **Terminal 2**: Frontend running
  ```bash
  cd schedify-fe
  npm start
  # Should see: Expo running on http://localhost:19002
  #            Connected to device/emulator
  ```

- [ ] **Test Accounts Created** (in MongoDB):
  - **Admin Account**
    - Email: `admin@schedify.com`
    - Password: `admin123`
  - **Student 1** (BSIT, 1st Year, Block A)
    - Email: `student1@schedify.com`
    - Password: `student123`
  - **Student 2** (BSCS, 2nd Year, Block B)
    - Email: `student2@schedify.com`
    - Password: `student123`

- [ ] **Test Schedules Created** (via admin account):
  - **Class Schedule**: Database Systems (BSIT, 1st Year, Block A, Monday 10-12 PM, Room 101)
  - **Event**: Midterm Exams (whole-university, March 15, 9-5 PM)
  - **Suspension**: No Classes (whole-university, March 21, all day)

- [ ] **Browser DevTools Ready**:
  - F12 to open DevTools
  - Network tab visible for showing API calls
  - Console tab visible for showing logs

- [ ] **Projector/Screen Share Ready**
  - Phone/Emulator visible to audience
  - Font size readable (zoom if needed)
  - WiFi/Network connected

---

## **Demo Flow**

### **Phase 1: Authentication (5 minutes)**

#### **Step 1.1: Student Login**
- [ ] App shows login screen
- [ ] Enter email: `student1@schedify.com`
- [ ] Enter password: `student123`
- [ ] Click "Login"
- [ ] **What happens:** Token saved to AsyncStorage, user navigated to Student Calendar
- [ ] **Show in DevTools**: Network tab → Login request → Response contains token
- [ ] **Talking point:** "Token stored locally and sent with every request"

#### **Step 1.2: Show Student Dashboard**
- [ ] Menu shows: Calendar, Events, Profile, Change Password, Logout
- [ ] Explain: "This is what a student sees"
- [ ] Check bottom navigation shows student tabs

#### **Step 1.3: Logout & Login as Admin**
- [ ] Click "Logout"
- [ ] Wait for login screen
- [ ] Enter email: `admin@schedify.com`
- [ ] Enter password: `admin123`
- [ ] Click "Login"
- [ ] **What happens:** Navigate to Admin Dashboard
- [ ] **Show to prof:** Menu shows: Post, All Schedules, Settings, Logout
- [ ] **Talking point:** "Different interface based on role - enforced by backend"

---

### **Phase 2: Admin Creating Content (10 minutes)**

#### **Step 2.1: Click "Post New Schedule"**
- [ ] Shows three buttons: Class Schedules, Events, Suspension
- [ ] Explain each type
- [ ] Click "Class Schedules"

#### **Step 2.2: Fill Class Schedule Form**
- [ ] **Department**: Select "CICT"
- [ ] **Course**: Should auto-populate with BSIT (show form logic)
- [ ] **Year Level**: Select "2nd Year"
- [ ] **Block**: Select "Block B"
- [ ] **Semester**: Select "1st Semester"
- [ ] Show the target tag updates: "BSIT 2nd Year Block B"
- [ ] Click "Add Subject"
- [ ] **Subject 1**:
  - Name: "Web Development"
  - Day: "Tues"
  - Time: "2:00 PM - 4:00 PM"
  - Room: "Lab 201"
  - Building: "Tech Building"
- [ ] Click "Add Subject" again
- [ ] **Subject 2**:
  - Name: "Database Design"
  - Day: "Thurs"
  - Time: "10:00 AM - 12:00 PM"
  - Room: "Room 304"
  - Building: "Tech Building"

#### **Step 2.3: Submit**
- [ ] Click "Save & Post Schedule for BSIT 2nd Year Block B"
- [ ] **Show in DevTools**: Network tab → POST /api/schedules
  - Show request headers (Authorization: Bearer...)
  - Show request body (JSON with all fields)
  - Show response (201 Created, schedule with _id)
- [ ] **Alert shows**: "Posted 2 subjects"
- [ ] Form resets
- [ ] **Talking point:** "Form validation, secure POST request, immediate UI feedback"

#### **Step 2.4: Create an Event (Optional, if time)**
- [ ] Click "Events" button
- [ ] **Title**: "Science Fair 2024"
- [ ] **Date**: "2024-03-25" (YYYY-MM-DD format)
- [ ] **Start Time**: "9:00 AM"
- [ ] **End Time**: "5:00 PM"
- [ ] **Audience Tag**: Select "whole-university"
- [ ] Click "Post Event"
- [ ] Show success alert

---

### **Phase 3: Admin Viewing & Managing Schedules (8 minutes)**

#### **Step 3.1: Click "All Schedules"**
- [ ] Shows accordion sections: Class Schedules (green), Events (blue), Suspension (red)
- [ ] Click on "Class Schedules" header to expand
- [ ] Explain color coding and structure

#### **Step 3.2: See the Schedule Just Created**
- [ ] Shows "Web Development" with date badge
- [ ] Shows metadata: time, room icons
- [ ] Shows tag: "BSIT 2nd Year Block B"
- [ ] Shows edit (✎) and delete (🗑) buttons on the right

#### **Step 3.3: Edit the Schedule**
- [ ] Click the edit button (✎) on the schedule
- [ ] Modal opens with form
- [ ] Show fields: Title, Tag, Time, Room, Description
- [ ] Change time: "2:00 PM - 4:00 PM" → "3:00 PM - 5:00 PM"
- [ ] Click "Save"
- [ ] **Show in DevTools**: Network tab → PUT /api/schedules/:id
  - Show request body with updated fields
  - Status 200 OK
- [ ] List refreshes automatically
- [ ] Schedule shows updated time
- [ ] **Talking point:** "Edit persists to database, list updates in real-time"

#### **Step 3.4: Delete a Schedule**
- [ ] Scroll down to another schedule
- [ ] Click the delete button (🗑)
- [ ] Confirmation alert: "Are you sure you want to delete...?"
- [ ] Click "Delete"
- [ ] **Show in DevTools**: Network tab → DELETE /api/schedules/:id
  - Status 200 OK
- [ ] Schedule disappears from list
- [ ] **Talking point:** "Safe delete with confirmation, backend enforces admin role"

---

### **Phase 4: Student Viewing Calendar (15 minutes)**

#### **Step 4.1: Logout & Login as Student**
- [ ] Click "Logout"
- [ ] Login with: `student1@schedify.com` / `student123`
- [ ] **What happens:** Navigate to Student Calendar (Month view by default)
- [ ] **Talking point:** "Now viewing as BSIT 1st Year Block A student"

#### **Step 4.2: Month View**
- [ ] Show full calendar grid
- [ ] Point out event chips on dates
- [ ] Explain color coding:
  - Green = Class Schedule
  - Blue = Event
  - Red = Suspension
- [ ] Click on a date with events → Show event list for that day
- [ ] **Talking point:** "Calendar shows only schedules for their department/course/year/block"

#### **Step 4.3: Search Feature (Highlight Integration!)**
- [ ] Tap on search box at top
- [ ] Type slowly: "D" → "Da" → "Data"
- [ ] **Show in DevTools**: Network tab
  - Shows requests batching (debounce at 250ms)
  - Request URL: `/api/schedules?search=data`
  - Shows backend filtering
- [ ] Results appear in dropdown showing:
  - Event name
  - Type (Class/Event/Suspension)
  - Details (time, room)
- [ ] **Talking point:** "Search queries the backend with regex on 10 fields: type, department, course, subject names, days, rooms, etc."
- [ ] Clear search, results disappear

#### **Step 4.4: Year View**
- [ ] Click "Year" button at bottom (if available)
- [ ] Shows 12 small calendars (one for each month)
- [ ] Shows small dots on dates with events
- [ ] **Tap on a date** with an event (e.g., March 15 for midterm)
- [ ] **What happens:** Switches to Month view at that date
- [ ] **Talking point:** "Year view for quick navigation, tap to jump to specific date in Month view"

#### **Step 4.5: Week View**
- [ ] Click "Week" button
- [ ] Shows 7-day card layout
- [ ] Each card shows events for that day:
  - Monday: (list of events)
  - Tuesday: (list of events)
  - etc.
- [ ] Each event shows: name, type, time, room
- [ ] **Talking point:** "Week view shows detailed event list for the current week"

#### **Step 4.6: Role-Based Access Control**
- [ ] **Try to navigate to admin endpoints:**
  - Attempt to find "Post" or "All Schedules" buttons
  - They don't exist (no menu item)
- [ ] **Show message:** "Students can only view, not create/edit/delete"
- [ ] **Explain backend enforcement:**
  - Even if frontend was hacked, backend has `requireAdmin` middleware

---

### **Phase 5: Student 2 (Different Department) (5 minutes)**

#### **Step 5.1: Logout & Login as Second Student**
- [ ] Click "Logout"
- [ ] Login with: `student2@schedify.com` / `student123`
- [ ] This student is: BSCS, 2nd Year, Block B

#### **Step 5.2: Show Different Data**
- [ ] Calendar shows different schedules than Student 1
- [ ] Only schedules for BSCS are visible
- [ ] Search results are filtered by their department/course/year/block
- [ ] **Talking point:** "Backend filters results based on user's role and academic info - students only see their own schedules"

---

## **Talking Points During Demo**

### **When Showing Login (5 mins)**
- "The backend stores role in the database, not from frontend input"
- "JWT tokens expire in 7 days"
- "Token is automatically sent with every API request"
- "Frontend determines UI based on returned role"

### **When Creating Schedule (10 mins)**
- "Admin form validates required fields before posting"
- "Backend requires admin role - enforced by middleware"
- "Search keyword is sent to backend as query parameter"
- "Backend searches across 10+ fields using MongoDB regex"
- "Multiple subjects in one schedule for flexibility"

### **When Editing/Deleting (8 mins)**
- "Confirmation prevents accidental deletions"
- "Edit modal only allows admins to modify schedules"
- "Backend returns updated data immediately"
- "List refreshes without full page reload"

### **When Showing Student Calendar (15 mins)**
- "Students see only schedules for their department/course/year/block"
- "Search is debounced (250ms) to reduce API calls"
- "Three view modes (Month/Year/Week) show same data, different layouts"
- "Year view provides quick navigation across months"
- "Color coding helps distinguish schedule types at a glance"

### **When Showing Role-Based Access (5 mins)**
- "Frontend enforces UX (hiding admin buttons for students)"
- "Backend enforces security (requireAdmin middleware on create/update/delete)"
- "Defense in depth - multiple layers of security"

---

## **Troubleshooting During Demo**

| Issue | Solution |
|-------|----------|
| Backend not responding | Check Terminal 1: `npm start` in schedify-be folder |
| Frontend not loaded | Check Terminal 2: `npm start` in schedify-fe folder |
| Login fails | Verify test accounts exist in MongoDB |
| Search not working | Check Network tab - verify API call is made |
| Calendar shows no events | Verify admin created test schedules for student's course |
| Edit modal doesn't appear | Try scrolling schedule list horizontally for more schedules |
| Keyboard dismissing | This was a bug we fixed - show the solution if asked |

---

## **Demo Timeline**

| Phase | Duration | Cumulative |
|-------|----------|-----------|
| Phase 1: Authentication | 5 min | 5 min |
| Phase 2: Admin Create | 10 min | 15 min |
| Phase 3: Admin Manage | 8 min | 23 min |
| Phase 4: Student View | 15 min | 38 min |
| Phase 5: Different Student | 5 min | 43 min |
| **Total** | **43 min** | |

**Extra time for questions/discussion: 15-20 minutes**

---

## **Key Features to Highlight**

1. ✅ **Separate frontend and backend**
2. ✅ **Role-based access control** (admin can create/edit/delete, students view-only)
3. ✅ **Full CRUD operations** (Create, Read, Update, Delete)
4. ✅ **Advanced search** with debouncing and regex
5. ✅ **Responsive UI** with multiple calendar views
6. ✅ **Real-time feedback** (alerts, status updates)
7. ✅ **Security** (JWT tokens, middleware, role enforcement)
8. ✅ **Dark/Light theme** support
9. ✅ **Mobile-first design** (React Native/Expo)
10. ✅ **Professional UI/UX** (animations, color coding, icons)

