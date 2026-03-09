# Schedify Presentation Script

**Total Duration:** 45-50 minutes (including Q&A)

---

## **INTRODUCTION (2 minutes)**

Good [morning/afternoon] Professor [Name]. Thank you for the time. Today, I'm going to present **Schedify** - a comprehensive schedule management system that demonstrates a fully integrated frontend and backend application.

This project showcases:
- Separate, scalable frontend (React Native) and backend (Express.js)
- Secure authentication and role-based access control
- Full CRUD operations with a clean user interface
- Professional mobile-first design with dark/light themes

Let me start by walking you through how it works, from the ground up.

---

## **PHASE 1: AUTHENTICATION (5 minutes)**

### **1.1 Explaining the Architecture**

"Before we see the app in action, let me explain the architecture briefly.

We have:
- **Frontend**: React Native with Expo - runs on iOS, Android, and web
- **Backend**: Express.js with MongoDB - handles all business logic and data persistence
- **Communication**: REST API with JWT token authentication

The separation is important because:
- Frontend and backend can be deployed independently
- Multiple client apps (web, mobile) can use the same backend
- Security is enforced on the backend, not the frontend"

### **1.2 Student Login**

*[Show login screen]*

"Let me login as a student. This is Juan Dela Cruz, a BSIT 1st year student in Block A."

*[Type email]*
- Email: `student1@schedify.com`

*[Type password]*
- Password: `student123`

*[Click Login]*

"When I click login, here's what happens:
1. Credentials are sent to the backend: POST /api/auth/login
2. Backend verifies the password against the hashed password in the database
3. Backend checks the user's role - in this case, 'student'
4. Backend returns a JWT token that expires in 7 days
5. Frontend stores the token locally and includes it in every future request
6. User is navigated to their dashboard"

*[Show Network tab in DevTools]*

"In the network tab, you can see the login request and the response containing the token. Every API request after this will include `Authorization: Bearer <token>` in the headers.

This is how the backend knows:
- Who the user is
- What role they have
- What data they should see"

### **1.3 Show Student Dashboard**

*[Navigate to main screen]*

"Notice the bottom navigation shows: Calendar, Events, Profile, Change Password, and Logout.

This is the student interface. Now let me login as an admin to show the difference."

*[Click Logout → Repeat login with admin account]*
- Email: `admin@schedify.com`
- Password: `admin123`

*[Show Admin Dashboard]*

"Now the navigation shows: Post (New Schedule), All Schedules, Settings, and Logout.

This is the admin interface. The backend returns a different role, so the frontend renders a different navigation structure. But notice - the role-based enforcement is done on BOTH:
- Frontend (for UX)
- Backend (for security)

This is called 'defense in depth' - even if someone tries to hack the frontend and access admin functionality, the backend checks the middleware and rejects the request."

---

## **PHASE 2: ADMIN CREATING CONTENT (10 minutes)**

### **2.1 Navigating to Post**

"Let me click 'Post New Schedule' to show how admins create content."

*[Click Post button]*

"I see three options:
1. **Class Schedules** - For posting course schedules to specific departments/courses/years/blocks
2. **Events** - For campus-wide events like graduation, guest lectures
3. **Suspension** - For notices like 'No classes due to holiday'"

### **2.2 Creating a Class Schedule**

*[Click Class Schedules]*

"Let me create a class schedule for a 2nd year BSIT student group."

*[Fill in the form step by step]*

**Department:** "Select CICT"
- When I select CICT, the Course dropdown automatically populates with: BSIT, BSCS, BSIS, BTVTED

**Course:** "Select BSIT"
- This makes sense - BSIT is under CICT

**Year Level:** "Select 2nd Year"
**Block:** "Select Block B"
**Semester:** "Select 1st Semester"

"Look at the 'Target Audience Tag' field. It shows: `BSIT 2nd Year Block B`. This tag is automatically generated and tells the system who this schedule is for. When 2nd year BSIT students login, only they'll see schedules with this tag. Students from other courses or years won't see it."

### **2.3 Adding Multiple Subjects**

*[Show subjects section]*

"A class schedule can have multiple subjects with different days and times. Let me add two subjects."

*[Click Add Subject]*

**Subject 1:**
- Name: "Web Development"
- Day: Tuesday
- Time: "2:00 PM - 4:00 PM"
- Room: "Lab 201"
- Building: "Tech Building"

*[Click Add Subject again]*

**Subject 2:**
- Name: "Database Design"
- Day: Thursday
- Time: "10:00 AM - 12:00 PM"
- Room: "Room 304"
- Building: "Tech Building"

*[Show delete button for subjects]*

"Each subject can be removed individually. This flexibility allows for clear scheduling."

### **2.4 Submitting the Schedule**

*[Scroll to bottom, click Save & Post]*

"Now I'll click 'Save & Post Schedule for BSIT 2nd Year Block B'."

*[Wait for success alert]*

"The alert shows: 'Posted 2 subjects'. The backend:
1. Verified the user is admin (requireAdmin middleware)
2. Validated all required fields
3. Created a new Schedule document in MongoDB
4. Returned the created schedule with an ID
5. Frontend shows confirmation and resets the form"

*[Show in Network tab]*

"In the Network tab, you can see the POST request to `/api/schedules` with:
- Headers: `Authorization: Bearer <token>`
- Body: Complete JSON with type, department, course, yearLevel, block, semester, tag, subjects
- Response: 201 Created with the full schedule object including _id"

---

## **PHASE 3: ADMIN VIEWING & MANAGING (8 minutes)**

### **3.1 Viewing All Schedules**

*[Click All Schedules]*

"Here's the 'All Schedules' page. It's organized in accordion sections:
- **Class Schedules** (green) - Click to expand/collapse
- **Events** (blue)
- **Suspensions** (red)

Let me expand Class Schedules."

*[Click header to expand]*

*[Show the schedule just created]*

"There's the schedule we just created! It shows:
- **Date badge** on the left (month and day)
- **Title**: Web Development
- **Metadata**: Time icon with hours, Room icon with location
- **Tag**: 'BSIT 2nd Year Block B' showing the target audience
- **Action buttons** on the right: Edit (✎) and Delete (🗑)"

### **3.2 Editing a Schedule**

"Let me click the edit button to modify this schedule."

*[Click edit button]*

"A modal opens with editable fields:
- Title
- Tag (audience)
- Time
- Room
- Description"

*[Change the time from "2:00 PM - 4:00 PM" to "3:00 PM - 5:00 PM"]*

*[Click Save]*

*[Show Network tab - PUT request]*

"The backend:
1. Receives the PUT request with modified fields
2. Verifies user is admin
3. Finds the schedule by ID
4. Updates the specified fields
5. Returns the updated schedule
6. Frontend replaces the old item with updated data"

*[Schedule list updates automatically]*

"Notice the list refreshed without reloading the entire page. The time now shows the updated value."

### **3.3 Deleting a Schedule**

"Now let me show deletion. I'll click the delete button on another schedule."

*[Click delete button]*

*[Confirmation dialog appears]*

"A confirmation dialog is shown: 'Are you sure you want to delete...? This action cannot be undone.'

This prevents accidental deletions. Let me click Delete to confirm."

*[Click Delete]*

*[Show Network tab - DELETE request]*

"The backend:
1. Receives the DELETE request with the schedule ID
2. Verifies the user is admin (requireAdmin middleware)
3. Finds and deletes the document from MongoDB
4. Returns success message
5. Frontend removes the item from the list"

*[Schedule disappears from list]*

"The schedule is gone. This demonstrates the full CRUD cycle:
- **C**reate: We posted a new schedule
- **R**ead: We viewed all schedules
- **U**pdate: We edited a schedule
- **D**elete: We deleted a schedule

All with proper authentication and authorization."

---

## **PHASE 4: STUDENT VIEWING & SEARCHING (15 minutes)**

### **4.1 Logout and Login as Student**

"Now let me logout and login as a student to show what they see."

*[Click Logout]*

*[Login with student1@schedify.com / student123]*

"I'm now logged in as Juan Dela Cruz - a BSIT 1st year student in Block A."

*[Show student dashboard]*

"The navigation is different now:
- Calendar (where we are now)
- Events
- Profile
- Change Password
- Logout

No 'Post' or 'All Schedules' options - students can only view, not create or modify."

### **4.2 Month View Calendar**

"This is the Month view. It shows:
- Full calendar grid of the current month
- **Event chips** on dates with schedules
- Color coding:
  - Green = Class Schedule
  - Blue = Event
  - Red = Suspension
- Day headers (Mon, Tue, Wed, etc.)
- Dates organized in weeks"

*[Click on a date with events]*

"When I click a date with events, it shows a list of events for that day with details like time, room, and type."

### **4.3 Search Feature - The Key Integration Point**

"Now let me show the search feature - this is where frontend and backend really integrate."

*[Tap search box at top]*

"A search input appears with a dropdown. Let me type something to search for."

*[Type slowly and deliberately]*
- Type: "D"
  - "Da"
  - "Data"

*[Show Network tab while typing]*

"Watch the Network tab. When I type 'Data', I'm not filtering locally. Instead:
1. The search input is debounced (waits 250ms after you stop typing)
2. A request is sent to the backend: GET `/api/schedules?search=data`
3. Backend performs a MongoDB regex search across 10 fields:
   - type
   - department
   - course
   - yearLevel
   - block
   - semester
   - tag
   - subjects.name
   - subjects.day
   - subjects.room
4. Results are returned and displayed in this dropdown"

*[Show search results in dropdown]*

"The search results show:
- Event name/title
- Event type (Class/Event/Suspension)
- Additional details (time, room, etc.)

Notice that only schedules matching the student's department/course/year/block are shown. Even though the backend searches all 10 fields, it also filters by the student's academic info.

Juan is BSIT 1st Year Block A, so he only sees schedules tagged for BSIT, 1st Year, and Block A. He wouldn't see schedules for BSCS or 2nd year."

*[Clear search]*

"The dropdown closes when I clear the search. This is a clean, efficient integration between frontend search UI and backend database queries."

### **4.4 Year View - Quick Navigation**

*[Click Year button (if available)]*

"This is the Year view. It shows 12 mini-calendars - one for each month.

Small dots appear on dates that have events. This gives a quick overview of the entire year."

*[Tap on a date with events]*

"When I tap a date - let's say March 15 which has midterm exams - it switches to the Month view focused on that specific date and month. This is useful for:
- Quick navigation across years
- Seeing which dates have events without scrolling
- Jumping directly to a date"

### **4.5 Week View - Detailed Event List**

*[Click Week button]*

"This is the Week view. Instead of a calendar, it shows a 7-day card layout.

Each card represents one day:
- **Monday**: [list of events]
- **Tuesday**: [list of events]
- etc.

Each event shows:
- Event name
- Type (indicated by color)
- Time
- Room

This view is best for:
- Seeing all events in the current week
- Planning the week ahead
- Seeing exact times without navigating the calendar"

### **4.6 Advanced Search Capabilities**

"Let me show one more search example to demonstrate the power of backend integration."

*[Type in search: "Room" or "101"]*

"The search isn't just searching by title. It searches by:
- Room numbers (so students can find where class is)
- Days of the week
- Times
- Types (Class, Event, Suspension)
- Subjects
- And more

This is all happening on the backend with MongoDB regex and text indexing."

---

## **PHASE 5: ROLE-BASED ACCESS CONTROL (5 minutes)**

### **5.1 Frontend Enforcement**

"I'm logged in as a student. Notice:
- No way to post schedules
- No way to edit schedules
- No way to delete schedules
- Only view and search

The frontend is designed to show different UIs based on the user's role. But..."

### **5.2 Backend Enforcement (Most Important!)**

"The frontend is one layer of security - the **UX layer**. But the real security is on the backend.

Let me show you the code:"

*[Show schedule.js routes file in code editor]*

```javascript
router.post('/', verifyToken, requireAdmin, createSchedule);
router.put('/:id', verifyToken, requireAdmin, updateSchedule);
router.delete('/:id', verifyToken, requireAdmin, deleteSchedule);
router.get('/', verifyToken, getSchedules);
```

"Look at the middleware chain:
1. **verifyToken** - Checks if the request has a valid JWT token
2. **requireAdmin** - Checks if the token's role is 'admin'

The POST, PUT, DELETE routes require BOTH middlewares.
The GET route only requires verifyToken.

So even if I:
- Were a hacker
- Modified the frontend to show admin buttons
- Made a POST request to `/api/schedules`

The backend would check:
1. Is there a token? (Check)
2. Is the token valid? (Check)
3. Is the user an admin? (FAIL - I'm a student)
4. Reject the request with 403 Forbidden

This is called 'defense in depth' - multiple layers of security."

### **5.3 Different Students, Different Data**

"Let me login as a second student to show another aspect of role-based filtering."

*[Logout and login with student2@schedify.com / student123]*

"This student is BSCS, 2nd Year, Block B - different academic info than Student 1.

When they view the calendar or search:
- Only schedules for BSCS are visible
- Only 2nd Year schedules are visible
- Only Block B schedules are visible
- University-wide events are visible

The backend filters based on the user's academic information stored in their profile."

*[Show calendar showing different schedules]*

"Notice the events are different from what Student 1 saw. This filtering happens on the backend - the student can't hack the frontend to see other schedules because the backend enforces it."

---

## **PHASE 6: TECHNICAL HIGHLIGHTS (5 minutes)**

### **6.1 API Integration Summary**

"Let me quickly summarize the API integration:

**Frontend makes these calls:**
- POST `/api/auth/login` - Student/admin login
- POST `/api/auth/register` - Student registration
- GET `/api/schedules` - Get schedules (with optional ?search=term)
- POST `/api/schedules` (admin only) - Create schedule
- PUT `/api/schedules/:id` (admin only) - Update schedule
- DELETE `/api/schedules/:id` (admin only) - Delete schedule

**Every request includes:**
- JWT token in Authorization header
- User information extracted from token

**Every response is filtered by:**
- User's role (admin vs student)
- User's academic info (department, course, year, block)"

### **6.2 Security Features**

"Security implemented at multiple levels:

1. **Frontend:**
   - Different UI for different roles
   - Form validation before submission
   - No sensitive data stored (only token)

2. **Backend Middleware:**
   - verifyToken - Validates JWT
   - requireAdmin - Checks role
   - Input validation
   - Password hashing with bcrypt

3. **Database:**
   - Role stored in database (not trusting frontend)
   - Academic info used for filtering
   - Unique constraints on email and ID number"

### **6.3 Real-time Features**

"Notice how smooth the experience is:
- No page reloads when creating/editing/deleting
- Lists update immediately
- Search results appear as you type (with debouncing)
- Confirmation dialogs prevent accidents
- Error messages guide users

This is because:
- Frontend manages state with React hooks
- Requests are async using Promises
- Lists refresh after API calls
- Debouncing prevents excessive backend load"

---

## **PHASE 7: SUMMARY & KEY ACHIEVEMENTS (3 minutes)**

"To summarize what Schedify demonstrates:

### **Architecture**
✅ Separate frontend (React Native) and backend (Express.js)
✅ REST API with JSON communication
✅ JWT token-based authentication
✅ Role-based routing and filtering

### **Features**
✅ User registration and login
✅ Full CRUD operations (Create, Read, Update, Delete)
✅ Advanced search with debouncing
✅ Multiple calendar views (Month, Year, Week)
✅ Role-based access control (Admin vs Student)
✅ Form validation and confirmation dialogs
✅ Dark/Light theme support

### **Security**
✅ JWT tokens with expiration
✅ Password hashing
✅ Backend middleware enforcement
✅ Role verification on sensitive operations
✅ Academic info-based filtering
✅ Defense in depth philosophy

### **Code Quality**
✅ Modular component structure
✅ Reusable API client
✅ TypeScript for type safety
✅ Error handling and user feedback
✅ Responsive design

This is a production-ready example of how to build modern web applications with proper separation of concerns, security, and user experience."

---

## **CLOSING (2 minutes)**

"Thank you for watching the demo. This project shows:
1. How frontend and backend communicate securely
2. How to implement role-based access control
3. How to build a responsive, modern UI
4. How to integrate multiple views of the same data
5. How to prioritize security at every level

Do you have any questions?"

---

## **Q&A RESPONSES**'

### **Q: "Why use JWT tokens instead of sessions?"**
A: "JWT tokens are stateless - the backend doesn't need to store sessions. They work great for distributed systems and mobile apps where the client carries all needed info. The token contains the user ID and role, which is enough for the backend to authenticate and authorize requests."

### **Q: "What happens if someone steals the token?"**
A: "Good question. If someone steals the token, they can impersonate the user until the token expires (7 days). In production, we'd:
1. Use shorter expiration times (like 1 hour)
2. Use refresh tokens to get new access tokens
3. Always send tokens over HTTPS (encrypted)
4. Store tokens securely (not in localStorage)
5. Add logout revocation lists"

### **Q: "Can students see other students' schedules?"**
A: "Students see schedules for their department, course, year level, and block - not individual student schedules. The filtering is enforced by the backend, so even if they tried to modify the frontend, the backend would reject unauthorized requests."

### **Q: "How does the debouncing work?"**
A: "When typing in search:
1. First keystroke: Set a 250ms timer
2. User types more: Cancel the timer, restart it
3. User stops typing: Timer completes, API call is made
This bunches rapid keystrokes into one API request, reducing backend load."

### **Q: "What database is being used?"**
A: "MongoDB - a NoSQL database that stores data as JSON documents. Each Schedule contains an array of subjects, so the document structure naturally matches our data model."

### **Q: "How does role-based filtering on the backend work?"**
A: "When a student requests schedules, we check:
- Is the schedule tagged for 'whole-university'? (Yes = visible)
- Does the schedule match ANY of the student's academic info? (Yes = visible)

For example, if 10 schedules exist but only tagged for BSIT, and the student is BSIT, they see only those. If a schedule is tagged for CBME (different course), they won't see it."

### **Q: "Is this deployed online?"**
A: "The backend is deployed on Render.com. The frontend can be deployed on Vercel or other platforms. Currently, it's running locally for development."

---

## **Presentation Tips**

1. **Move slowly** - Give audience time to absorb information
2. **Point and click** - Keep your mouse pointer visible
3. **Narrate actions** - Explain what's happening before it happens
4. **Check DevTools** - Pause on network requests to show integration
5. **Ask rhetorical questions** - Engage the audience
6. **Be confident** - You built this!
7. **Handle mistakes gracefully** - "Let me refresh the page" or "Let me try that again"
8. **Keep time** - Use a timer to stay on schedule
9. **Save best for last** - End with the most impressive demo
10. **Open with familiarity** - Start with what they know (login), progress to complexity

---

**Good luck with your presentation!** 🎉

