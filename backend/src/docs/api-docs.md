# SmartHR Authentication API Documentation

## Overview
SmartHR is an AI-powered resume screening and candidate ranking platform. This API handles authentication, authorization, and user management for the platform.

**Base URL:** `http://localhost:5000/api`

**API Version:** 1.0.0

---

## Table of Contents
1. [Authentication](#authentication)
2. [Endpoints](#endpoints)
3. [Error Codes](#error-codes)
4. [Rate Limiting](#rate-limiting)
5. [Security](#security)

---

## Authentication

### Authentication Flow
1. **Register** - Create a new account
2. **Login** - Authenticate and receive JWT token
3. **Token Storage** - JWT stored in HttpOnly cookie automatically
4. **Authorization** - Include token in subsequent requests

### Token Usage
The JWT token is automatically stored in an HttpOnly cookie. For frontend development, the token is also returned in the response body.

**Option 1: Cookie (Recommended for production)**
```javascript
// Automatically sent with every request
// Cookie name: token
{
  "id": 1,
  "email": "user@example.com",
  "role": "candidate",
  "iat": 1700000000,
  "exp": 1700086400
}
{
  "fullName": "Ada Johnson",
  "email": "ada.johnson@example.com",
  "phone": "+1234567890",
  "password": "SecurePass123!",
  "role": "candidate"
}
{
  "success": true,
  "message": "Account created successfully.",
  "data": {
    "id": 1,
    "fullName": "Ada Johnson",
    "email": "ada.johnson@example.com",
    "phone": "+1234567890",
    "role": "candidate",
    "status": "active",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
{
  "success": false,
  "message": "Email already registered"
}
{
  "email": "ada.johnson@example.com",
  "password": "SecurePass123!"
}
{
  "success": true,
  "user": {
    "id": 1,
    "name": "Ada Johnson",
    "email": "ada.johnson@example.com",
    "role": "candidate"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0"
}
{
  "success": false,
  "message": "Invalid credentials"
}
{
  "success": false,
  "message": "Account is suspended. Please contact support."
}
{
  "success": true,
  "user": {
    "id": 1,
    "fullName": "Ada Johnson",
    "email": "ada.johnson@example.com",
    "phone": "+1234567890",
    "role": "candidate",
    "status": "active",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
{
  "refreshToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0"
}
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
{
  "refreshToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0"
}
{
  "success": true,
  "message": "Logged out successfully"
}
{
  "email": "ada.johnson@example.com"
}
{
  "success": true,
  "message": "Password reset link sent to email"
}
{
  "token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0",
  "newPassword": "NewSecurePass123!"
}
{
  "success": true,
  "message": "Password reset successfully"
}
{
  "success": true,
  "message": "Candidate Dashboard",
  "user": {
    "id": 1,
    "email": "ada.johnson@example.com",
    "role": "candidate"
  },
  "data": {
    "applications": 5,
    "interviews": 2,
    "offers": 0,
    "recentlyViewed": [
      "Senior Developer - Google",
      "Product Manager - Microsoft"
    ]
  }
}
{
  "success": true,
  "message": "Candidate Profile",
  "user": {
    "id": 1,
    "fullName": "Ada Johnson",
    "email": "ada.johnson@example.com",
    "phone": "+1234567890",
    "role": "candidate"
  }
}
{
  "fullName": "Ada Johnson-Smith",
  "phone": "+9876543210"
}
{
  "success": true,
  "message": "Profile updated successfully"
}
{
  "success": true,
  "message": "Recruiter Dashboard",
  "user": {
    "id": 1,
    "email": "recruiter@example.com",
    "role": "recruiter"
  },
  "data": {
    "activeJobs": 8,
    "totalApplicants": 124,
    "pendingReviews": 15,
    "recentActivity": [
      "Job posted: Senior Developer",
      "Interview scheduled: Ada Johnson"
    ]
  }
}
{
  "success": true,
  "message": "Recruiter Jobs",
  "jobs": [
    {
      "id": 1,
      "title": "Senior Developer",
      "applicants": 25,
      "status": "Active"
    },
    {
      "id": 2,
      "title": "Product Manager",
      "applicants": 18,
      "status": "Active"
    }
  ]
}
{
  "success": true,
  "message": "Recruiter Applicants",
  "applicants": [
    {
      "id": 1,
      "name": "Ada Johnson",
      "position": "Senior Developer",
      "matchScore": "94%"
    },
    {
      "id": 2,
      "name": "Bob Smith",
      "position": "Product Manager",
      "matchScore": "87%"
    }
  ]
}
{
  "success": true,
  "message": "Admin Dashboard",
  "user": {
    "id": 1,
    "email": "admin@smarthr.com",
    "role": "admin"
  },
  "data": {
    "totalUsers": 1500,
    "totalCandidates": 1200,
    "totalRecruiters": 250,
    "totalAdmins": 50,
    "activeSessions": 342
  }
}
{
  "success": true,
  "message": "System Statistics",
  "stats": {
    "totalUsers": 1500,
    "totalJobs": 450,
    "totalApplications": 3200,
    "averageMatchScore": "86%",
    "dailyActiveUsers": 890
  }
}
{
  "success": true,
  "message": "Admin Users List",
  "users": [
    {
      "id": 1,
      "name": "Ada Johnson",
      "email": "ada@email.com",
      "role": "candidate",
      "status": "active"
    },
    {
      "id": 2,
      "name": "Bob Smith",
      "email": "bob@email.com",
      "role": "recruiter",
      "status": "active"
    }
  ]
}
{
  "action": "updateStatus",
  "data": {
    "status": "active"
  }
}
{
  "success": true,
  "message": "User updated successfully",
  "userId": 1
}
{
  "success": false,
  "message": "Human-readable error message",
  "errors": [
    {
      "field": "fieldName",
      "message": "Specific validation error"
    }
  ]
}
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1700000000
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/smarthr_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="24h"

# Security
COOKIE_SECURE=true
COOKIE_HTTPONLY=true
COOKIE_SAMESITE=lax

# CORS
CORS_ORIGIN="http://localhost:3000"

Just copy the entire block above and paste it into your `docs/api-docs.md` file.