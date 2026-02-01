// Database Query Examples - How Login Works With Your Online Database
// This shows the actual SQL-like operations happening behind the scenes

// ============================================
// 1. LOGIN QUERY - Find user by email
// ============================================

// Prisma Query:
const user = await prisma.user.findUnique({
  where: { email: 'test@example.com' }
});

// Equivalent SQL:
// SELECT * FROM "User" WHERE email = 'test@example.com';

// ============================================
// 2. PASSWORD VALIDATION
// ============================================

// JavaScript (bcrypt comparison):
const isPasswordValid = await bcrypt.compare('password123', user.password);

// This compares plain password against hashed password in database
// Hashed example: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/KFm

// ============================================
// 3. UPDATE LAST LOGIN
// ============================================

// Prisma Query:
await prisma.user.update({
  where: { id: 1 },
  data: { lastLogin: new Date() }
});

// Equivalent SQL:
// UPDATE "User" SET lastLogin = CURRENT_TIMESTAMP WHERE id = 1;

// ============================================
// 4. REGISTRATION QUERY - Check if email exists
// ============================================

// Prisma Query:
const existingUser = await prisma.user.findUnique({
  where: { email: 'newuser@example.com' }
});

// Equivalent SQL:
// SELECT * FROM "User" WHERE email = 'newuser@example.com';

// ============================================
// 5. REGISTRATION QUERY - Create new user
// ============================================

// Prisma Query:
const newUser = await prisma.user.create({
  data: {
    email: 'newuser@example.com',
    password: '$2a$10$hashedPasswordHere',
    name: 'John Doe',
    role: 'user',
    isActive: true
  }
});

// Equivalent SQL:
// INSERT INTO "User" (email, password, name, role, isActive, createdAt, updatedAt)
// VALUES ('newuser@example.com', '$2a$10$...', 'John Doe', 'user', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
// RETURNING *;

// ============================================
// DATABASE FLOW DIAGRAM
// ============================================

/*

User Browser                    Your Backend Server               Supabase PostgreSQL (Online)
     |                                  |                                    |
     |--POST /api/auth/login---------->|                                    |
     |   {email, password}              |                                    |
     |                                  |                                    |
     |                                  |--Query: Find user by email-------->|
     |                                  |   SELECT * FROM "User"            |
     |                                  |   WHERE email = ?                  |
     |                                  |                                    |
     |                                  |<--Return user data-----------------|
     |                                  |   {id: 1, email, password_hash...} |
     |                                  |                                    |
     |                                  |--Validate password (bcrypt)------->| (Local)
     |                                  |   Compare plain vs hashed          |
     |                                  |                                    |
     |                                  |--Update lastLogin timestamp------->|
     |                                  |   UPDATE "User" SET lastLogin...   |
     |                                  |                                    |
     |                                  |<--Confirm update------------------|
     |                                  |                                    |
     |<--Return JWT Token and User------|                                    |
     |   {token, user data}             |                                    |
     |                                  |                                    |

*/

// ============================================
// PASSWORD HASHING EXAMPLE
// ============================================

// When user registers with password "password123":

// 1. Bcrypt hashes it:
const hashedPassword = await bcrypt.hash('password123', 10);
// Result: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/KFm

// 2. Stored in database:
await prisma.user.create({
  data: {
    email: 'user@example.com',
    password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/KFm'  // Hashed!
  }
});

// 3. When user logs in with "password123":
const isMatch = await bcrypt.compare('password123', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/KFm');
// Returns: true (password matches!)

// ============================================
// JWT TOKEN FLOW
// ============================================

// 1. Token created after successful login:
const token = jwt.sign(
  {
    id: user.id,
    email: user.email,
    role: user.role
  },
  process.env.JWT_SECRET,  // 'your_jwt_secret_key_here'
  { expiresIn: '7d' }
);

// Result: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwi...

// 2. Client stores token and sends with requests:
headers: {
  'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwi...'
}

// 3. authMiddleware verifies token:
const decoded = jwt.verify(token, process.env.JWT_SECRET);
// If valid: Extracts {id, email, role} and allows request
// If invalid: Returns 401 Unauthorized

// ============================================
// COMPLETE LOGIN SEQUENCE
// ============================================

/*

REQUEST:
POST /api/auth/login
{
  "email": "test@example.com",
  "password": "password123"
}

MIDDLEWARE: loginValidator
  1. Validate input (email format, password exists)
  2. Query Supabase: SELECT * FROM "User" WHERE email = 'test@example.com'
  3. Compare password with bcrypt
  4. Generate JWT token
  5. Update lastLogin: UPDATE "User" SET lastLogin = NOW() WHERE id = 1
  6. Attach user and token to request

CONTROLLER: authController.login
  1. Send token and user data back

RESPONSE:
200 OK
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

*/

// ============================================
// NOW YOUR DATA IS:
// ✅ Stored in online Supabase PostgreSQL
// ✅ Password is hashed (bcrypt)
// ✅ User sessions tracked with JWT
// ✅ Last login recorded in database
// ✅ Ready for production!
// ============================================
