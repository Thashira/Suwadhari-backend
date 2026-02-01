# 🏥 Updated API Documentation - Extended User Fields

## User Model Fields

Your User table now includes all the requested fields:

| Field | Type | Required | Unique | Description |
|-------|------|----------|--------|-------------|
| `id` | Integer | Auto | Yes | Primary key |
| `physician_id` | String | No | Yes | Unique physician identifier |
| `name` | String | **Yes** | No | Full name |
| `birth_day` | DateTime | No | No | Date of birth |
| `nic` | String | No | Yes | National Identity Card number |
| `username` | String | No | Yes | Unique username for login |
| `address_id` | Integer | No | No | Foreign key to address table |
| `email` | String | **Yes** | Yes | Email address (for login) |
| `tel` | String | No | No | Telephone number |
| `password` | String | **Yes** | No | Hashed password |
| `role` | String | No | No | User role (default: "user") |
| `created_at` | DateTime | Auto | No | Registration timestamp |
| `updated_at` | DateTime | Auto | No | Last update timestamp |

---

## 🔐 Registration Endpoint

### POST `/api/auth/register`

**Request Body:**
```json
{
  "email": "doctor@hospital.com",
  "password": "securePassword123",
  "confirmPassword": "securePassword123",
  "name": "Dr. John Smith",
  "physicianId": "PHY12345",
  "birthDay": "1985-06-15",
  "nic": "198512345678",
  "username": "drjohnsmith",
  "addressId": 1,
  "tel": "+94771234567",
  "role": "doctor"
}
```

**Required Fields:**
- `email` ✅
- `password` ✅
- `confirmPassword` ✅
- `name` ✅

**Optional Fields:**
- `physicianId` (must be unique)
- `birthDay` (ISO 8601 date format)
- `nic` (must be unique)
- `username` (must be unique)
- `addressId` (integer)
- `tel`
- `role` (defaults to "user")

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "physicianId": "PHY12345",
    "name": "Dr. John Smith",
    "birthDay": "1985-06-15T00:00:00.000Z",
    "nic": "198512345678",
    "username": "drjohnsmith",
    "addressId": 1,
    "email": "doctor@hospital.com",
    "tel": "+94771234567",
    "role": "doctor",
    "createdAt": "2026-02-01T10:30:00.000Z",
    "updatedAt": "2026-02-01T10:30:00.000Z"
  }
}
```

**Error Responses:**

```json
// 409 Conflict - Email exists
{
  "success": false,
  "message": "User with this email already exists"
}

// 409 Conflict - Username exists
{
  "success": false,
  "message": "Username already taken"
}

// 409 Conflict - NIC exists
{
  "success": false,
  "message": "User with this NIC already exists"
}

// 409 Conflict - Physician ID exists
{
  "success": false,
  "message": "Physician ID already registered"
}

// 400 Bad Request - Validation error
{
  "success": false,
  "message": "Email, password, and name are required"
}
```

---

## 🔓 Login Endpoint

### POST `/api/auth/login`

**Request Body:**
```json
{
  "email": "doctor@hospital.com",
  "password": "securePassword123"
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
      "physicianId": "PHY12345",
      "name": "Dr. John Smith",
      "birthDay": "1985-06-15T00:00:00.000Z",
      "nic": "198512345678",
      "username": "drjohnsmith",
      "addressId": 1,
      "email": "doctor@hospital.com",
      "tel": "+94771234567",
      "role": "doctor",
      "createdAt": "2026-02-01T10:30:00.000Z",
      "updatedAt": "2026-02-01T10:30:00.000Z"
    }
  }
}
```

---

## 📋 Example Usage

### Register a Doctor
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@hospital.com",
    "password": "securePass123",
    "confirmPassword": "securePass123",
    "name": "Dr. John Smith",
    "physicianId": "PHY12345",
    "birthDay": "1985-06-15",
    "nic": "198512345678",
    "username": "drjohnsmith",
    "tel": "+94771234567",
    "role": "doctor"
  }'
```

### Register a Regular User (Minimal Fields)
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient@example.com",
    "password": "password123",
    "confirmPassword": "password123",
    "name": "Jane Doe"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@hospital.com",
    "password": "securePass123"
  }'
```

---

## 🔄 Migration Required

**IMPORTANT:** Run this command to update your database schema:

```bash
npx prisma migrate dev --name add_user_extended_fields
```

This will:
1. Create new columns in the User table
2. Add indexes for `username`, `nic`, and `physicianId`
3. Update the database to match the new schema

---

## 📊 Database Schema (SQL)

```sql
CREATE TABLE "User" (
  id SERIAL PRIMARY KEY,
  physician_id VARCHAR(50) UNIQUE,
  name VARCHAR(255) NOT NULL,
  birth_day TIMESTAMP,
  nic VARCHAR(20) UNIQUE,
  username VARCHAR(100) UNIQUE,
  address_id INTEGER,
  email VARCHAR(255) UNIQUE NOT NULL,
  tel VARCHAR(20),
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  isActive BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_user_username ON "User"(username);
CREATE INDEX idx_user_nic ON "User"(nic);
CREATE INDEX idx_user_physician_id ON "User"(physician_id);
```

---

## 🎯 Validation Rules

1. **Email**
   - Must be valid email format
   - Must be unique
   - Required for registration

2. **Password**
   - Minimum 6 characters
   - Must match `confirmPassword`
   - Hashed with bcrypt (10 salt rounds)

3. **Physician ID**
   - Must be unique if provided
   - Optional field

4. **NIC**
   - Must be unique if provided
   - Optional field

5. **Username**
   - Must be unique if provided
   - Optional field

6. **Birth Day**
   - ISO 8601 date format: "YYYY-MM-DD"
   - Converted to DateTime in database

7. **Address ID**
   - Integer value
   - Optional (can be linked to Address table later)

---

## 🔐 Security Features

✅ All passwords are hashed with bcrypt before storage
✅ JWT tokens expire after 7 days
✅ Unique constraints on email, username, NIC, physicianId
✅ Input validation on all fields
✅ SQL injection protection via Prisma ORM
✅ lastLogin timestamp tracking

---

## 💡 Next Steps

1. Run database migration:
   ```bash
   npx prisma migrate dev --name add_user_extended_fields
   ```

2. Regenerate Prisma Client:
   ```bash
   npx prisma generate
   ```

3. Restart your server:
   ```bash
   npm run dev
   ```

4. Test registration with new fields!

---

## 🆘 Common Issues

**Issue:** `Unknown arg 'physicianId' in data.physicianId`
- **Solution:** Run `npx prisma generate` after migration

**Issue:** `Unique constraint failed on the fields: (username)`
- **Solution:** Username already exists, use different username

**Issue:** `Invalid date format`
- **Solution:** Use ISO 8601 format: "YYYY-MM-DD"

---

Your User model now supports all the requested fields! 🎉
