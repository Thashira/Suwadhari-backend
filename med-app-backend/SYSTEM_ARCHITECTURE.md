# 🏗️ Complete System Architecture

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         YOUR FRONTEND APP                              │
│                       (React/Vue/Angular)                              │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP Requests
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                    YOUR BACKEND SERVER                                  │
│                  (Express.js on Node.js)                               │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Routes                                                            │  │
│  │  POST /api/auth/login                                           │  │
│  │  POST /api/auth/register                                        │  │
│  │  POST /api/auth/logout                                          │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                    │                                      │
│                                    ↓                                      │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Middleware (loginValidator.js)                                   │  │
│  │                                                                   │  │
│  │ 1. Validate input (email, password)                             │  │
│  │ 2. Query Database: Find user by email                           │  │
│  │ 3. Compare password (bcrypt)                                    │  │
│  │ 4. Generate JWT token                                           │  │
│  │ 5. Update lastLogin timestamp                                   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                    │                                      │
│                                    ↓                                      │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Controllers (authController.js)                                 │  │
│  │                                                                   │  │
│  │ - register()                                                    │  │
│  │ - login()                                                       │  │
│  │ - logout()                                                      │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                    │                                      │
│                                    ↓                                      │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Prisma ORM (Database Connector)                                 │  │
│  │                                                                   │  │
│  │ - prisma.user.findUnique()                                      │  │
│  │ - prisma.user.create()                                          │  │
│  │ - prisma.user.update()                                          │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                 Connection String via TCP/SSL
                                    │
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                   SUPABASE (PostgreSQL Online)                          │
│              https://db.bysmcdmxnpvjutrkxamu.supabase.co              │
│                                                                          │
│  Database: postgres                                                      │
│  Port: 5432                                                             │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Tables                                                            │  │
│  │                                                                   │  │
│  │ ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │  │
│  │ │      User       │  │     Clinic      │  │ MedicalRecord   │  │  │
│  │ ├─────────────────┤  ├─────────────────┤  ├─────────────────┤  │  │
│  │ │ id (PK)         │  │ id (PK)         │  │ id (PK)         │  │  │
│  │ │ email (UNIQUE)  │  │ name            │  │ userId (FK)     │  │  │
│  │ │ password (HASH) │  │ address         │  │ patientName     │  │  │
│  │ │ name            │  │ city            │  │ diagnosis       │  │  │
│  │ │ role            │  │ state           │  │ treatment       │  │  │
│  │ │ isActive        │  │ zipCode         │  │ prescription    │  │  │
│  │ │ lastLogin       │  │ phone           │  │ visitDate       │  │  │
│  │ │ createdAt       │  │ email (UNIQUE)  │  │ createdAt       │  │  │
│  │ │ updatedAt       │  │ createdAt       │  │ updatedAt       │  │  │
│  │ │                 │  │ updatedAt       │  │                 │  │  │
│  │ └─────────────────┘  └─────────────────┘  └─────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Login Flow Sequence Diagram

```
┌──────────┐         ┌──────────┐         ┌──────────┐         ┌──────────┐
│  Browser │         │ Backend  │         │ Prisma   │         │Supabase  │
│          │         │ Server   │         │   ORM    │         │Database  │
└──────────┘         └──────────┘         └──────────┘         └──────────┘
     │                    │                    │                    │
     │ 1. POST /api/auth/login               │                    │
     │    {email, password}                   │                    │
     ├──────────────────────────────────────>│                    │
     │                    │                   │                    │
     │                    │ 2. loginValidator │                    │
     │                    │    validates input│                    │
     │                    │                   │                    │
     │                    │ 3. prisma.user.   │                    │
     │                    │    findUnique()   │                    │
     │                    ├──────────────────>│                    │
     │                    │                   │ 4. SQL SELECT      │
     │                    │                   │    WHERE email = ?  │
     │                    │                   ├──────────────────>│
     │                    │                   │                    │
     │                    │                   │ 5. Return user     │
     │                    │                   │    {id, email,     │
     │                    │                   │     password_hash..}│
     │                    │                   │<──────────────────┤
     │                    │<──────────────────┤                    │
     │                    │                   │                    │
     │                    │ 6. bcrypt.compare │                    │
     │                    │    password       │                    │
     │                    │                   │                    │
     │                    │ 7. If match:      │                    │
     │                    │    jwt.sign()     │                    │
     │                    │                   │                    │
     │                    │ 8. prisma.user.   │                    │
     │                    │    update()       │                    │
     │                    │    (lastLogin)    │                    │
     │                    ├──────────────────>│                    │
     │                    │                   │ 9. SQL UPDATE      │
     │                    │                   │    lastLogin = NOW()│
     │                    │                   ├──────────────────>│
     │                    │                   │                    │
     │                    │                   │ 10. Confirm update │
     │                    │                   │<──────────────────┤
     │                    │<──────────────────┤                    │
     │                    │                   │                    │
     │ 11. Return 200 OK  │                   │                    │
     │     {token, user}  │                   │                    │
     │<──────────────────┤                    │                    │
     │                   │                    │                    │
     │ 12. Store token   │                    │                    │
     │     in localStorage│                   │                    │
     │                   │                    │                    │
```

---

## Registration Flow

```
User enters: email, password, name
                 ↓
POST /api/auth/register
                 ↓
registerValidator middleware
                 ↓
Validate inputs (email format, password match)
                 ↓
Query Supabase: SELECT * FROM "User" WHERE email = ?
                 ↓
Email exists? 
    ├─ YES → Return 409 Conflict (Email already exists)
    │
    └─ NO → Continue
                 ↓
Hash password with bcrypt (10 rounds salt)
                 ↓
prisma.user.create({
  email, password: hashed, name, role: 'user'
})
                 ↓
INSERT INTO "User" (email, password, name, role, isActive, createdAt, updatedAt)
VALUES (...) RETURNING *;
                 ↓
User record created in Supabase
                 ↓
Return 201 Created {id, email, name, role, createdAt}
                 ↓
User can now login!
```

---

## Data Security

```
┌─────────────────────────────────────────────────────────────────┐
│ SECURITY LAYERS                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ 1. HTTPS/SSL
│    └─ All data encrypted in transit (Supabase enforces this)   │
│                                                                  │
│ 2. PASSWORD HASHING (Bcrypt)
│    User password: "password123"
│    Stored: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3..."        │
│    ├─ One-way function (cannot reverse)                         │
│    ├─ 10 salt rounds (slows down attacks)                       │
│    └─ Unique hash per password                                  │
│                                                                  │
│ 3. JWT TOKEN
│    token = sign({id, email, role}, SECRET_KEY, 7d expiry)      │
│    ├─ Signed with secret key (backend only knows it)           │
│    ├─ Expires after 7 days                                      │
│    └─ Cannot be forged without secret                           │
│                                                                  │
│ 4. DATABASE SECURITY
│    ├─ Supabase manages backups & encryption at rest             │
│    ├─ SSL connection on port 5432                               │
│    ├─ User credentials in .env (not committed to git)           │
│    └─ Environment variables never exposed                       │
│                                                                  │
│ 5. VALIDATION
│    ├─ Email format validation                                   │
│    ├─ Password length requirement (6+ chars)                    │
│    ├─ Unique email constraint in database                       │
│    └─ Input sanitization                                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## API Endpoints

```
┌─────────────────────────────────────────────────────────────────┐
│ AUTHENTICATION ENDPOINTS                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ POST /api/auth/register                                          │
│ ├─ Request:  {email, password, confirmPassword, name}           │
│ ├─ Middleware: registerValidator (database check)               │
│ ├─ Database: INSERT user into "User" table                      │
│ └─ Response: {id, email, name, role, createdAt}                │
│                                                                  │
│ POST /api/auth/login                                             │
│ ├─ Request:  {email, password}                                  │
│ ├─ Middleware: loginValidator (database query + token)          │
│ ├─ Database: SELECT user FROM "User" WHERE email = ?            │
│ ├─ Database: UPDATE lastLogin timestamp                         │
│ └─ Response: {token, user{id, email, name, role}}              │
│                                                                  │
│ POST /api/auth/logout                                            │
│ ├─ Request:  {} (empty body)                                    │
│ ├─ Middleware: None (frontend discards token)                   │
│ └─ Response: {message: 'Logged out successfully'}              │
│                                                                  │
│ Protected Routes (require JWT token):                            │
│ ├─ GET /api/clinics (with authMiddleware)                       │
│ ├─ POST /api/records (with authMiddleware)                      │
│ └─ etc...                                                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## File Dependencies

```
package.json (npm modules)
    ├─ @prisma/client ← Connects to database
    ├─ express ← Web server
    ├─ jsonwebtoken ← JWT tokens
    ├─ bcryptjs ← Password hashing
    ├─ cors ← Cross-origin requests
    └─ dotenv ← Environment variables

prisma/schema.prisma
    ├─ Defines User, Clinic, MedicalRecord models
    └─ Connects via DATABASE_URL from .env

middleware/
    ├─ loginValidator.js ← Uses @prisma/client to query database
    ├─ registerValidator.js ← Uses @prisma/client to query database
    ├─ authMiddleware.js ← Verifies JWT tokens
    └─ errorHandler.js ← Handles errors

src/controllers/
    ├─ authController.js ← Uses @prisma/client to create users
    ├─ clinicController.js ← Will use @prisma/client
    └─ recordController.js ← Will use @prisma/client

.env
    └─ DATABASE_URL=postgresql://...
```

---

## Summary: What Happens When User Logs In

```
1. User types email & password in browser
2. Frontend sends POST /api/auth/login to your server
3. loginValidator middleware runs:
   a) Validates email format
   b) Queries Supabase for user with that email
   c) Gets back encrypted password from database
   d) Compares plain password with hashed password
   e) If match → generates JWT token
   f) Updates lastLogin timestamp in database
   g) Passes control to controller
4. authController receives validated user & token
5. Sends back {token, user data} to frontend
6. Frontend stores token
7. Frontend uses token in future requests
   Authorization: Bearer <token>
8. Backend verifies token with authMiddleware
9. Token valid → Allow request to proceed
10. All data is synchronized with your online Supabase database

YOUR ENTIRE LOGIN SYSTEM IS NOW DATABASE-BACKED! ✨
```
