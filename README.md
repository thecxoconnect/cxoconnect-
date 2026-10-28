# CXO Connect - Premier Executive Community Platform

A full-stack monorepo platform tailored exclusively for C-Suite Executives, VPs, and Founders. CXO Connect enables confidential peer advisory, boardroom governance, curated conclaves, and strategic business alliances.

---

## 🏛️ Monorepo Architecture

```
cxo-connect/
├── client/                     # React 18 + Vite + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/         # Navbar, Hero, DomeGallery, ChromaGrid, StarBorder, etc.
│   │   ├── context/            # AuthContext (JWT session state & role guards)
│   │   ├── features/           # Admin Dashboard (approvals, metrics, faculty)
│   │   ├── pages/              # Home, About, Events, KnowledgeHub, Membership, Contact,
│   │   │                       # Login, VerifyOTP, CompleteProfile, Profile, CXOQuiz
│   │   ├── services/           # Axios API modules with Bearer token interceptor
│   │   ├── App.jsx             # React Router DOM mapping
│   │   ├── main.jsx            # Application entry
│   │   └── index.css           # Tailwind + glassmorphism + executive buttons
│   ├── index.html              # HTML shell with Google Fonts (Playfair Display & Inter)
│   ├── tailwind.config.js      # Executive dark-navy palette & typography tokens
│   ├── vite.config.js          # Vite config with API proxy to :5000
│   └── package.json
│
├── server/                     # Node.js + Express ES Modules + MongoDB Backend
│   ├── config/                 # db.js (MongoDB), email.js (Nodemailer), passport.js (OAuth)
│   ├── controllers/            # auth, member, event, comment, committee, mentor,
│   │                           # sponsor, quiz, contact, imagekit, chapter
│   ├── middleware/             # authMiddleware (isAuth, isAdmin, isMainAdmin), uploadMiddleware
│   ├── models/                 # User, Event, Comment, Committee, Mentor, Sponsor, Question, Chapter
│   ├── routes/                 # Express routers mounted under /api
│   ├── scripts/                # seed.js (pre-populated C-suite records & admin accounts)
│   ├── server.js               # Express application entry & global error handler
│   └── package.json
│
├── .env.example                # Canonical environment template
├── .gitignore                  # Git tracking rules
├── package.json                # Root monorepo orchestrator (npm workspaces + concurrently)
└── README.md                   # System documentation
```

---

## 🔐 Core Security & Authentication

1. **Passwordless Email OTP**:
   - Dispatches a 6-digit numeric OTP valid for 10 minutes via branded HTML email template.
   - Issues a 15-minute temporary verification token.
   - Upon verification, issues a 30-day session JWT Bearer token.
2. **Role-Based Access Control**:
   - `isAuth`: Validates JWT Bearer token and attaches user to `req.user`.
   - `isAdmin`: Requires JWT validation + `role === 'admin'` + `status === 'accepted'`.
   - `isMainAdmin`: Requires JWT validation + `role === 'admin'` + `isMainAdmin === true`.
3. **Admissions Workflow**:
   - Accounts are created with `status: 'pending'`.
   - Members complete their executive profile (Name, Title, Company, City, Phone, LinkedIn).
   - Platform Administrators review and approve (`accepted`) or reject (`rejected`) applicants via the Admin Control Console.

---

## 🚀 Quickstart & Local Development

### 1. Prerequisites
- **Node.js** v18+ installed
- **MongoDB** running locally on `mongodb://127.0.0.1:27017/cxoconnect`

### 2. Install Dependencies
```bash
# Install root, server, and client dependencies
npm run install:all
```

### 3. Configure Environment Variables
Copy `.env.example` to `server/.env`:
```bash
cp .env.example server/.env
```

### 4. Seed Executive Database
Populate the database with verified C-Suite mentors, committee members, upcoming conclaves, regional chapters, and default admin accounts:
```bash
npm run seed
```

**Default Seeded Admin Accounts:**
- `theanvisharma@gmail.com` (Super Administrator / Founder)
- `admin@cxoconnect.com` (Main Administrator)

### 5. Launch Full-Stack Application
Start both the Express backend (`:5000`) and the Vite React frontend (`:5173`) concurrently:
```bash
npm run dev
```

Visit the application in your browser:
- **Client Frontend**: `http://localhost:5173`
- **REST API Backend**: `http://localhost:5000/api`

---

## 📡 API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/manual` | Initiates email OTP verification | Public |
| `POST` | `/api/auth/verify-otp` | Validates 6-digit OTP, issues 30-day session JWT | Public |
| `POST` | `/api/auth/resend-otp` | Re-dispatches a fresh 6-digit OTP | Public |
| `POST` | `/api/auth/complete-profile` | Updates executive credentials | `isAuth` |
| `GET` | `/api/auth/me` | Fetches active authenticated user payload | `isAuth` |
| `GET` | `/api/auth/linkedin` | LinkedIn OAuth 2.0 flow | Public |

### Members Directory & Governance (`/api/members`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/members/stats` | Executive platform metrics (pending, accepted, total) | `isAdmin` |
| `GET` | `/api/members` | Filterable executive member directory | `isAdmin` |
| `GET` | `/api/members/:id` | Member details | `isAdmin` |
| `PUT` | `/api/members/:id/status` | Approve (`accepted`) or reject (`rejected`) account | `isAdmin` |
| `PUT` | `/api/members/:id/role` | Promote/demote to admin | `isMainAdmin` |
| `DELETE` | `/api/members/:id` | Remove account | `isAdmin` |

### Executive Conclaves & Summits (`/api/events`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/events` | List all summits (optional `category` filter) | Public |
| `GET` | `/api/events/:id` | Conclave details with attendees | Public |
| `POST` | `/api/events` | Schedule a new executive conclave | `isAdmin` |
| `PUT` | `/api/events/:id` | Update conclave details | `isAdmin` |
| `DELETE` | `/api/events/:id` | Remove conclave | `isAdmin` |
| `POST` | `/api/events/:id/rsvp` | Toggle seat reservation for event | `isAuth` |

### Discussions & Insights (`/api/comments`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/comments` | Retrieve insights (filter by `eventId`) | Public |
| `POST` | `/api/comments` | Share strategic perspective on an event | `isAuth` |
| `POST` | `/api/comments/:id/like` | Endorse insight | `isAuth` |
| `DELETE` | `/api/comments/:id` | Remove insight | Author / Admin |

### Faculty & Advisory Board (`/api/mentors`, `/api/committee`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/mentors` | Retrieve C-Suite mentor directory | Public |
| `POST` | `/api/mentors/request` | Request 1-on-1 strategic advisory session | `isAuth` |
| `POST` | `/api/mentors` | Onboard new mentor | `isAdmin` |
| `GET` | `/api/committee` | Retrieve advisory board & committee roster | Public |

### Assessments & Inquiries (`/api/quiz`, `/api/contact`, `/api/partners`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/quiz/questions` | Retrieve leadership assessment scenarios | Public |
| `POST` | `/api/quiz/submit` | Evaluate archetype & trait breakdown | Public |
| `POST` | `/api/contact` | Submit inquiry to executive secretariat | Public |
| `GET` | `/api/sponsors` | Retrieve corporate sponsors by tier | Public |
| `POST` | `/api/sponsors/inquiry` | Submit corporate partnership inquiry | Public |

---

## 🎨 Design System & Executive Aesthetics

- **Color Palette**: Tailored dark-navy (`#070B19`, `#0D1424`, `#111A2E`), royal blue accents (`#1D4ED8`, `#2563EB`), and platinum/gold touches.
- **Typography**: Google Font **Playfair Display** (editorial, authoritative serif headings) paired with **Inter** (clean, crisp sans-serif body).
- **Glassmorphism & Shadows**: Custom utilities (`.glass-card`, `.premium-card`, `.btn-executive-pill`) creating modern executive contrast.
- **Internal Routing**: Built strictly with React Router DOM; no dead links or external redirects.
