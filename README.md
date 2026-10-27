# CXO Connect / HRSG Backend

High-security Express.js (ES Module) backend with MongoDB (Mongoose) for the **CXO Connect** Executive Platform by **HRSG (Human Resource Solutions Group)**.

---

## 🌟 Specification Implementation Overview

### 1. Data Model (`models/User.js`)
* **Core Metadata Fields**: `name`, `email` (unique, lowercase), `linkedinId` (unique, sparse), `googleId` (unique, sparse), `phone`, `company`, `linkedin`, `city`, `pincode`, `position`, `profileImage`.
* **Role Hierarchy**: `role` (`'member'` | `'admin'`, default `'member'`), `isMainAdmin` (Boolean, default `false`).
* **Account Statuses**: `status` (`'pending'` | `'accepted'` | `'rejected'`, default `'pending'`), `profileComplete` (Boolean, default `false`), `isEmailVerified` (Boolean, default `false`).
* **One-Time Passwords (OTP)**: `otp` (String), `otpExpires` (Date).
* **Sanitization**: Automatic exclusion of `otp` and `otpExpires` in JSON serialization and responses via `toSafeJSON()`.

### 2. Middleware Guards (`middleware/auth.js`)
* Reads JSON Web Token from `Authorization: Bearer <token>`.
* `isAuth`: Cryptographically verifies token signature, fetches active user from MongoDB, attaches to `req.user`.
* `isAdmin`: Enforces `role === 'admin' AND status === 'accepted'`.
* `isMainAdmin`: Enforces `role === 'admin' AND isMainAdmin === true`.
* `upload`: File upload middleware leveraging `multer.memoryStorage()`, strictly restricted to image mimetypes under 5MB.

### 3. Authentication Controllers (`controllers/authController.js`)
* `manualAuth`: Accepts `{ email, role }`.
  * Super Admin Whitelist Check: If email is in the hardcoded super admin list, forces `role = 'admin'`, `status = 'accepted'`, and `isMainAdmin = true`.
  * Generates 6-digit numeric OTP (expires in 10 minutes).
  * Dispatches responsive HTML email via Nodemailer branded with HRSG and the requested navigation links.
  * Issues 15-minute verification JWT (`purpose: 'otp_verification'`).
* `googleCallback` & `linkedinCallback`: Passport OAuth 2.0 flow using profile details (`req.googleProfile` / `req.linkedinProfile`), role consistency checks, OTP generation, and redirect to `${CLIENT_URL}/verify-otp?token=${tempToken}`.
* `verifyOTP`: Validates 6-digit OTP against user record and verification token. Clears OTP, sets `isEmailVerified = true`, and issues 30-day session JWT with full user payload.
* `resendOTP`: Re-issues fresh 6-digit numeric OTP and resets expiration time to 10 minutes.
* `completeProfile`: Protected endpoint (`isAuth`) to update metadata (`name`, `city`, `company`, `position`, `phone`, `pincode`, `linkedin`) and processes 5MB image uploads into base64 data URIs, setting `profileComplete = true`.
* `getMe`: Protected endpoint returning authenticated executive user payload.

### 4. Server Entry (`server.js`) & Navigation Bar
* Modern Express 5 ES Module architecture (`"type": "module"`).
* Loads `.env`, enables `cors()`, `express.json({ limit: '10mb' })`, Passport initialization, Morgan request logging, mounts `/api`, and handles errors globally.
* Serves a state-of-the-art interactive test console at `/` featuring the exact navigation bar:
  * [Home](https://www.myhrsg.org/)
  * [About Us](https://www.myhrsg.org/about)
  * [HR Events](https://www.myhrsg.org/events)
  * [Knowledge Hub](https://www.myhrsg.org/knowledge-hub)
  * [Membership](https://www.myhrsg.org/membership)
  * [Partners & Sponsors](https://www.myhrsg.org/partners)
  * [Contact Us](https://www.myhrsg.org/contact)
  * [Dashboard](https://www.myhrsg.org/profile)

---

## 🚀 Getting Started

### Prerequisites
* Node.js v18+ (tested on v22.17.1)
* MongoDB (running on `mongodb://127.0.0.1:27017/cxo_connect`)

### Installation
```bash
# Clone and enter workspace
npm install
```

### Configuration (`.env`)
Create a `.env` file from `.env.example`:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5000
MONGO_URI=mongodb://127.0.0.1:27017/cxo_connect
JWT_SECRET=cxo_connect_super_secret_jwt_key_2026_modern_backend
SUPER_ADMIN_EMAILS=theanvisharma@gmail.com,admin@myhrsg.org,superadmin@cxoconnect.com
FROM_EMAIL="CXO Connect / HRSG" <no-reply@myhrsg.org>
```

### Running the Server
```bash
# Start production server
npm start

# Or run with nodemon in development
npm run dev
```

Visit the interactive test harness and documentation at:
**`http://localhost:5000`**

---

## 🧪 Automated Test Suite
Run the 15/15 unit & integration test suite:
```bash
npm test
```
Run upload and size limit tests:
```bash
node test/upload.test.js
```

---

## 📡 API Reference

| Method | Endpoint | Protection | Description |
|---|---|---|---|
| `POST` | `/api/auth/manual` | Public | Send 6-digit OTP & 15m verification token |
| `POST` | `/api/auth/verify-otp` | Temp Token | Validate OTP, clear OTP, issue 30d session JWT |
| `POST` | `/api/auth/resend-otp` | Public / Token | Re-issue fresh 6-digit OTP |
| `GET` | `/api/auth/me` | `isAuth` | Get current executive profile payload |
| `POST` | `/api/auth/complete-profile` | `isAuth` | Update metadata & upload profile image (<5MB) |
| `GET` | `/api/auth/google` | Public | Initiate Google OAuth 2.0 flow |
| `GET` | `/api/auth/linkedin` | Public | Initiate LinkedIn OAuth 2.0 flow |
| `GET` | `/api/users` | `isAuth, isAdmin` | Admin user directory with status filter |
| `PATCH` | `/api/users/:id/status` | `isAuth, isAdmin` | Accept or reject membership |
| `PATCH` | `/api/users/:id/role` | `isAuth, isMainAdmin` | Promote / demote roles |
| `GET` | `/api/navbar` | Public | Returns official navbar configuration |
| `GET` | `/api/health` | Public | Backend health and uptime metrics |
