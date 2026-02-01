# Database Setup & Migration Guide

## 📌 Your Database Connection
You're using **Supabase PostgreSQL** (Free tier)

**Database URL in .env:**
```
postgresql://postgres:bosilukariya@db.bysmcdmxnpvjutrkxamu.supabase.co:5432/postgres
```

---

## 🚀 Quick Start - 3 Steps

### Step 1: Install Dependencies
```bash
npm install
```
This installs `@prisma/client` and all other dependencies needed to connect to your online database.

### Step 2: Create Database Tables using Prisma Migration
```bash
npx prisma migrate dev --name init
```
This will:
- Create all tables in your online Supabase database (User, Clinic, MedicalRecord)
- Generate Prisma client for your project
- Create a migrations folder

### Step 3: (OPTIONAL) Seed Sample Data
```bash
npx prisma db seed
```
Or manually insert a test user:
```bash
npx prisma studio
```
Then manually add users through Prisma Studio UI

---

## 📝 Manual SQL - If You Want To Run Queries Directly

### Create Users Table
```sql
CREATE TABLE IF NOT EXISTS "User" (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  isActive BOOLEAN DEFAULT true,
  lastLogin TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_user_email ON "User"(email);
```

### Create Clinics Table
```sql
CREATE TABLE IF NOT EXISTS "Clinic" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100),
  state VARCHAR(100),
  zipCode VARCHAR(20),
  phone VARCHAR(20),
  email VARCHAR(255) UNIQUE NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_clinic_email ON "Clinic"(email);
```

### Create Medical Records Table
```sql
CREATE TABLE IF NOT EXISTS "MedicalRecord" (
  id SERIAL PRIMARY KEY,
  userId INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  patientName VARCHAR(255) NOT NULL,
  diagnosis TEXT NOT NULL,
  treatment TEXT NOT NULL,
  prescription TEXT,
  visitDate TIMESTAMP NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_medical_record_userId ON "MedicalRecord"(userId);
CREATE INDEX idx_medical_record_visitDate ON "MedicalRecord"(visitDate);
```

### Insert Test User (for login)
```sql
-- Password: "password123" (bcrypt hashed)
INSERT INTO "User" (email, password, name, role, isActive) 
VALUES ('test@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/KFm', 'Test User', 'user', true);
```

---

## 🔓 Login Endpoints

### Register New User
**POST** `/api/auth/register`
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "name": "John Doe"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "email": "newuser@example.com",
    "name": "John Doe",
    "role": "user",
    "createdAt": "2026-02-01T12:00:00Z"
  }
}
```

### Login User
**POST** `/api/auth/login`
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User logged in successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "test@example.com",
      "name": "Test User",
      "role": "user"
    }
  }
}
```

### Logout User
**POST** `/api/auth/logout`
```json
{}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User logged out successfully"
}
```

---

## 🔐 How It Works

1. **User sends login request** → `POST /api/auth/login`
2. **loginValidator middleware** → Queries your online Supabase database for the user
3. **Validates password** using bcrypt hashing
4. **Generates JWT token** if credentials are valid
5. **Updates lastLogin timestamp** in database
6. **Returns token** to user for authenticated requests

---

## 📊 Database Schema (Prisma)

Your `prisma/schema.prisma` file defines:

```prisma
model User {
  id        Int @id @default(autoincrement())
  email     String @unique
  password  String
  name      String
  role      String @default("user")
  isActive  Boolean @default(true)
  lastLogin DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  medicalRecords MedicalRecord[]
}
```

All data is now stored in your online PostgreSQL database!

---

## ✅ Verify Setup

1. Go to Supabase Dashboard: https://supabase.com
2. Select your project
3. Go to **Database** → **Tables**
4. You should see tables: `User`, `Clinic`, `MedicalRecord`
5. Click on `User` table → Add test data manually or use login endpoint

---

## 🆘 Troubleshooting

**Issue:** `Error: connect ENOENT /var/run/postgresql/.s.PGSQL.5432`
- ✅ Solution: Ensure DATABASE_URL is correct in .env

**Issue:** `User table does not exist`
- ✅ Solution: Run `npx prisma migrate dev --name init`

**Issue:** Login returns `Invalid email or password`
- ✅ Solution: Make sure user exists in database with correct password hash

**Issue:** Cannot connect to Supabase
- ✅ Solution: Check internet connection & DATABASE_URL format
