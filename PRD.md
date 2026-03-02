# Product Requirements Document — SocialApp

> University Final Project · 2 Students · Deadline: 2–4 weeks

---

## 1. Executive Summary

SocialApp is a full-stack social media platform built for a university final project. It enables registered users to share posts (text + image), interact with other users' content through comments and likes, and discover content using AI-powered natural language search.

The platform is built with Node.js/Express (TypeScript) on the backend and React/TypeScript/Vite on the frontend. It uses local MongoDB, JWT authentication with refresh tokens, and Google OAuth as a social login provider. All images are stored on the server filesystem. The application is deployed to the college server with HTTPS and runs persistently via PM2.

**MVP Goal:** Deliver a working social feed where authenticated users can post text+image content, browse an infinite-scrolling feed, interact via likes and comments, search posts using natural language, and manage their own profile — fully deployed and accessible via a public HTTPS URL.

---

## 2. Mission

**Build a secure, production-grade social platform that demonstrates full-stack engineering skills — from JWT auth and REST API design to AI integration and cloud deployment.**

### Core Principles

1. **Security first** — JWT + Refresh tokens, HTTPS everywhere, authenticated MongoDB.
2. **Clean architecture** — MVC on the backend (BaseController pattern), component-driven frontend.
3. **AI as a feature, not a gimmick** — Natural language search must genuinely improve content discovery.
4. **Production quality** — Unit tests, Swagger docs, PM2, TypeScript-only codebase.
5. **Git discipline** — Small commits, pull requests, each team member contributes visibly.

---

## 3. Target Users

### Primary Persona — Registered User
- A person who creates an account and actively posts content.
- Wants to share text + image posts with others.
- Wants to interact (like, comment) with others' posts.
- Wants to find specific posts quickly using natural language.
- Comfortable with basic web apps (login, feed, profile).

### Secondary Persona — Visitor / Browsing User
- A logged-in user who mostly browses rather than creates.
- Primarily consumes the feed, reads comments, and likes posts.
- Still needs a registered account (no anonymous browsing required by the assignment).

### Key User Needs
| Need | How SocialApp Addresses It |
|---|---|
| Share content easily | Simple post creation form (text + image upload) |
| Find relevant content | AI-powered free-text search |
| Engage with others | Comments + likes with counters visible in feed |
| Manage own identity | Editable profile (username + photo) |
| Secure access | JWT auth + Google OAuth |

---

## 4. MVP Scope

### Core Functionality
- ✅ User registration with username + password
- ✅ User login with username + password
- ✅ Google OAuth login (social sign-in)
- ✅ JWT access token + refresh token flow
- ✅ Persistent login (remember user across sessions)
- ✅ Logout (invalidate refresh token)
- ✅ User profile screen (photo + username + own posts)
- ✅ Edit profile: username and profile photo
- ✅ Create post: text + image upload
- ✅ View all posts in main feed (infinite scroll)
- ✅ Edit own post (text and image)
- ✅ Delete own post
- ✅ View only own posts (filtered view or separate screen)
- ✅ Comment on any post
- ✅ View comments on a separate screen
- ✅ Comment count displayed per post in feed
- ✅ Like / unlike a post
- ✅ Like count and status displayed per post
- ✅ AI-powered free-text natural language search over posts
- ✅ Infinite scroll / progressive loading in main feed

### Technical
- ✅ TypeScript only (both frontend and backend)
- ✅ Images stored on server filesystem (multer)
- ✅ Local MongoDB on college server (with auth credentials)
- ✅ Swagger documentation for all backend APIs
- ✅ Jest unit tests for all server API routes (excluding external AI API)
- ✅ PM2 process manager (production mode)
- ✅ HTTPS for both backend and frontend
- ✅ Deployed to college server with public URL
- ✅ Git: small commits, pull requests, each member's contributions visible

### Out of Scope (Future)
- ❌ Facebook OAuth (only Google required)
- ❌ Email/password update in profile edit
- ❌ Direct messaging between users
- ❌ Notifications (push or in-app)
- ❌ Post categories / hashtags
- ❌ Follow / following system
- ❌ Video uploads
- ❌ Admin dashboard
- ❌ Atlas or cloud MongoDB
- ❌ External image storage (S3, Cloudinary)

---

## 5. User Stories

### Authentication

**US-01** — Registration
> As a new visitor, I want to register with a username and password, so that I can create an account and access the platform.
- Example: User fills in username + password → account created → redirected to feed.

**US-02** — Login
> As a returning user, I want to log in with my username and password (or Google), so that I can access my account securely.
- Example: User enters credentials → receives JWT access + refresh token → session persists on refresh.

**US-03** — Persistent Session
> As a logged-in user, I want the app to remember me between page refreshes, so that I don't have to re-login every time.
- Example: Refresh token is stored (httpOnly cookie or localStorage), used to silently renew access token.

**US-04** — Logout
> As a logged-in user, I want to log out, so that my session is ended securely.
- Example: Click logout → refresh token invalidated on backend → redirected to login page.

### Profile

**US-05** — View Profile
> As any logged-in user, I want to view a user's profile page, so that I can see their info and posts.
- Example: Navigate to `/profile/:userId` → see photo, username, and their posts.

**US-06** — Edit My Profile
> As the logged-in user viewing my own profile, I want to edit my username and profile photo, so that I can keep my identity up to date.
- Example: Click "Edit" → upload new photo or type new username → save.

### Content

**US-07** — Create Post
> As a logged-in user, I want to create a post with text and an image, so that I can share content with others.
- Example: Click "New Post" → type caption → upload image → submit → post appears in feed.

**US-08** — Infinite Scroll Feed
> As a logged-in user, I want to scroll through a feed of all posts that loads more content automatically, so that I can browse without interruption.
- Example: Feed loads 10 posts → scroll to bottom → next 10 load seamlessly.

**US-09** — Like a Post
> As a logged-in user, I want to like or unlike posts, so that I can express appreciation for content I enjoy.
- Example: Click heart icon → like count increments → icon fills → click again to unlike.

**US-10** — Comment on a Post
> As a logged-in user, I want to comment on a post, so that I can engage in conversation around content.
- Example: Click comment count badge → navigate to comments screen → type and submit comment.

**US-11** — AI Natural Language Search
> As a logged-in user, I want to search posts using plain English phrases, so that I can find relevant content without needing exact keywords.
- Example: Type "photos of dogs at the beach" → AI interprets intent → relevant posts returned.

---

## 6. Core Architecture & Patterns

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    College Server (HTTPS)                    │
│                                                             │
│  ┌──────────────────┐        ┌──────────────────────────┐  │
│  │  React Frontend  │◄──────►│   Express Backend API    │  │
│  │  (Vite, port 443)│  HTTPS │   (Node.js, port 4040)   │  │
│  └──────────────────┘        └──────────┬───────────────┘  │
│                                         │                   │
│                              ┌──────────▼───────────────┐  │
│                              │   Local MongoDB           │  │
│                              │   (authenticated)         │  │
│                              └──────────────────────────┘  │
│                                         │                   │
│                              ┌──────────▼───────────────┐  │
│                              │   /uploads filesystem     │  │
│                              │   (profile & post images) │  │
│                              └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                                         │
                              ┌──────────▼───────────────┐
                              │  External AI API          │
                              │  (Gemini / ChatGPT)       │
                              └──────────────────────────┘
```

### Backend Directory Structure

```
backend/
├── src/
│   ├── controllers/
│   │   ├── base.controller.ts       # Generic CRUD BaseController<T>
│   │   ├── auth.controller.ts
│   │   ├── users.controller.ts
│   │   ├── posts.controller.ts
│   │   ├── comments.controller.ts
│   │   └── ai.controller.ts
│   ├── models/
│   │   ├── user.model.ts
│   │   ├── post.model.ts
│   │   └── comment.model.ts
│   ├── routes/
│   │   ├── auth.route.ts
│   │   ├── users.route.ts
│   │   ├── posts.route.ts
│   │   ├── comments.route.ts
│   │   └── ai.route.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts       # JWT verification
│   │   └── upload.middleware.ts     # multer config
│   ├── services/
│   │   └── ai.service.ts            # AI provider abstraction
│   ├── tests/
│   │   ├── auth.test.ts
│   │   ├── users.test.ts
│   │   ├── posts.test.ts
│   │   └── comments.test.ts
│   ├── app.ts
│   └── server.ts
├── uploads/
│   ├── profiles/
│   └── posts/
├── .env
├── swagger.yaml (or inline via swagger-jsdoc)
└── package.json
```

### Frontend Directory Structure

```
front_b/
├── src/
│   ├── components/
│   │   ├── PostCard/
│   │   ├── CommentList/
│   │   ├── ProfileHeader/
│   │   └── SearchBar/
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── FeedPage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── CommentsPage.tsx
│   │   └── MyPostsPage.tsx
│   ├── services/
│   │   ├── api-client.ts            # Axios instance (baseURL: backend)
│   │   ├── auth.service.ts
│   │   ├── posts.service.ts
│   │   ├── comments.service.ts
│   │   └── ai.service.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── usePosts.ts
│   │   └── useInfiniteScroll.ts
│   ├── context/
│   │   └── AuthContext.tsx
│   └── App.tsx
└── package.json
```

### Key Design Patterns

**Backend:**
- `BaseController<T>` with generic `getAll`, `getById`, `create`, `update`, `delete`
- Each resource controller extends `BaseController` and overrides where needed
- Auth middleware applied per-route (not globally)
- AI service abstracted behind an interface — easy to swap Gemini ↔ ChatGPT
- Multer middleware for image uploads, serving `/uploads` as static

**Frontend:**
- React functional components (`FC`) with hooks first pattern
- Custom hooks encapsulate data fetching + AbortController cleanup
- Services return `{ request: Promise, abort: () => void }`
- `CanceledError` handled gracefully in hooks
- Single Axios instance in `services/api-client.ts` with interceptor for token refresh
- CSS Modules + Bootstrap 5.3 for styling

---

## 7. Features

### 7.1 Authentication & Session Management

| Sub-feature | Details |
|---|---|
| Register | POST `/auth/register` — username + password → bcrypt hash → create User |
| Login | POST `/auth/login` → return `{ accessToken, refreshToken }` |
| Google OAuth | Passport.js Google strategy → issue same JWT pair |
| Refresh Token | POST `/auth/refresh` → validate stored refresh token → issue new access token |
| Logout | POST `/auth/logout` → invalidate/delete refresh token from DB |
| Remember User | Refresh token stored client-side, auto-refresh on 401 |

### 7.2 User Profile

| Sub-feature | Details |
|---|---|
| View Profile | GET `/users/:id` — returns username, profileImage URL |
| View Own Posts | GET `/posts?userId=:id` (reuses posts endpoint with filter) |
| Edit Username | PUT `/users/:id` — update username field |
| Edit Photo | PUT `/users/:id` with multipart — saves to `/uploads/profiles/` |

### 7.3 Posts & Feed

| Sub-feature | Details |
|---|---|
| Create Post | POST `/posts` — text + image upload (multer), saved to `/uploads/posts/` |
| Feed (all posts) | GET `/posts?page=:n&limit=10` — cursor/offset-based pagination |
| Infinite Scroll | Frontend hook detects scroll → fetches next page → appends to list |
| Edit Post | PUT `/posts/:id` — owner only (middleware check) |
| Delete Post | DELETE `/posts/:id` — owner only, also deletes image from filesystem |
| My Posts | GET `/posts?userId=:id` or separate `/users/:id/posts` |
| Post Fields | `_id`, `userId`, `text`, `imageUrl`, `likesCount`, `likedBy[]`, `commentCount`, `createdAt` |

### 7.4 Comments

| Sub-feature | Details |
|---|---|
| Add Comment | POST `/comments` — `{ postId, text }` |
| Get Comments | GET `/comments?postId=:id` — returns comments for a post |
| Comment Count | Stored as `commentCount` on Post document (incremented/decremented) |
| Comments Screen | Separate React page/route: `/posts/:id/comments` |
| Delete Comment | DELETE `/comments/:id` — owner only |

### 7.5 Likes

| Sub-feature | Details |
|---|---|
| Like Post | POST `/posts/:id/like` |
| Unlike Post | DELETE `/posts/:id/like` |
| DB Design | `likedBy: [ObjectId]` array on Post + `likesCount: number` field |
| Efficient Check | `likedBy.includes(userId)` to show filled/empty heart; count from `likesCount` |
| Toggle Logic | Backend checks if userId already in `likedBy` → add or remove + update count atomically |

> **DB Efficiency Note:** `likesCount` is a denormalized counter kept in sync with `likedBy` array, avoiding expensive `$count` aggregations on every read.

### 7.6 AI — Natural Language Search

| Sub-feature | Details |
|---|---|
| Endpoint | POST `/ai/search` — `{ query: string }` |
| Flow | Backend sends user query + recent post texts to AI → AI returns matched/ranked post IDs or summarized intent → backend queries DB → returns posts |
| Rate Limiting | Backend caches recent AI results (in-memory or TTL in MongoDB) to avoid duplicate API calls |
| Provider Abstraction | `ai.service.ts` exports `search(query)` — swap provider by changing env var |
| Frontend | Search bar on feed page → calls `/ai/search` → renders results inline |

---

## 8. Technology Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | 20+ LTS | Runtime |
| Express | 4.x | HTTP framework |
| TypeScript | 5.x | Language |
| Mongoose | 8.x | MongoDB ODM |
| MongoDB | 7.x (local) | Database |
| Passport.js | 0.7.x | OAuth strategy |
| passport-google-oauth20 | latest | Google OAuth |
| jsonwebtoken | 9.x | JWT signing/verification |
| bcrypt | 5.x | Password hashing |
| multer | 1.x | File upload middleware |
| cors | 2.x | CORS headers |
| dotenv | 16.x | Env config |
| swagger-jsdoc + swagger-ui-express | latest | API docs |
| Jest + Supertest | latest | Unit/integration tests |
| PM2 | latest | Process management |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18.x | UI framework |
| TypeScript | 5.x | Language |
| Vite | 5.x | Build tool + dev server |
| Axios | 1.x | HTTP client |
| Bootstrap | 5.3 | CSS framework |
| CSS Modules | (Vite built-in) | Scoped styles |
| React Router | 6.x | Client-side routing |

### External Integrations
| Service | Purpose |
|---|---|
| Google OAuth 2.0 | Social login |
| Gemini API / OpenAI API | AI natural language search (TBD) |

---

## 9. Security & Configuration

### Authentication Flow

```
1. Register/Login → backend issues:
   - accessToken  (short TTL: 15 min)
   - refreshToken (long TTL: 7 days, stored in DB)

2. Frontend stores both tokens (localStorage or memory).

3. Axios interceptor:
   - Attaches accessToken to every request (Authorization: Bearer <token>)
   - On 401 → calls POST /auth/refresh with refreshToken
   - Retries original request with new accessToken

4. Logout → DELETE refreshToken from DB → clear client storage
```

### Google OAuth Flow

```
1. Frontend redirects to GET /auth/google
2. Passport handles Google callback
3. Backend creates/finds user → issues JWT pair
4. Redirects to frontend with tokens
```

### Environment Variables (`.env`)

```env
PORT=4040
MONGO_URI=mongodb://username:password@localhost:27017/socialapp
JWT_SECRET=<secret>
JWT_REFRESH_SECRET=<secret>
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
GOOGLE_CLIENT_ID=<google_client_id>
GOOGLE_CLIENT_SECRET=<google_client_secret>
GOOGLE_CALLBACK_URL=https://<college-server>/auth/google/callback
AI_PROVIDER=gemini           # or openai
AI_API_KEY=<api_key>
CLIENT_URL=https://<college-server>
NODE_ENV=production
```

### Security Scope

**In Scope:**
- ✅ Password hashing with bcrypt
- ✅ JWT access + refresh token rotation
- ✅ Route-level auth middleware (protected routes)
- ✅ Owner-only checks for edit/delete (posts, comments, profile)
- ✅ HTTPS on both frontend and backend
- ✅ MongoDB authenticated connection
- ✅ CORS restricted to known frontend origin

**Out of Scope:**
- ❌ CSRF protection (not required by assignment)
- ❌ Rate limiting on auth endpoints (not required)
- ❌ Input sanitization beyond basic validation
- ❌ Role-based access control (RBAC)

### Deployment

- Backend: PM2 in cluster or fork mode, `NODE_ENV=production`
- Frontend: `vite build` → served as static files (via nginx or Express static)
- HTTPS: SSL certificate on college server (nginx reverse proxy or Express https module)
- MongoDB: local instance on college server, authenticated

---

## 10. API Specification

### Auth Routes

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | No | Register new user |
| POST | `/auth/login` | No | Login, receive tokens |
| POST | `/auth/refresh` | No | Refresh access token |
| POST | `/auth/logout` | Yes | Logout, invalidate refresh token |
| GET | `/auth/google` | No | Initiate Google OAuth |
| GET | `/auth/google/callback` | No | Google OAuth callback |

**POST /auth/register**
```json
Request:  { "username": "john", "password": "secret123" }
Response: { "accessToken": "...", "refreshToken": "...", "user": { "_id": "...", "username": "john" } }
```

**POST /auth/login**
```json
Request:  { "username": "john", "password": "secret123" }
Response: { "accessToken": "...", "refreshToken": "...", "user": { "_id": "...", "username": "john", "profileImage": "..." } }
```

### User Routes

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/users/:id` | Yes | Get user profile |
| PUT | `/users/:id` | Yes (owner) | Update username and/or profile photo |

**PUT /users/:id** — multipart/form-data
```
Fields: username (optional), profileImage (file, optional)
Response: { "_id": "...", "username": "...", "profileImage": "/uploads/profiles/filename.jpg" }
```

### Post Routes

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/posts` | Yes | Get all posts (paginated) |
| GET | `/posts?userId=:id` | Yes | Get posts by user |
| POST | `/posts` | Yes | Create post |
| PUT | `/posts/:id` | Yes (owner) | Update post |
| DELETE | `/posts/:id` | Yes (owner) | Delete post |
| POST | `/posts/:id/like` | Yes | Like post |
| DELETE | `/posts/:id/like` | Yes | Unlike post |

**GET /posts** — Query params: `page` (default 1), `limit` (default 10)
```json
Response: {
  "posts": [
    {
      "_id": "...",
      "userId": { "_id": "...", "username": "john", "profileImage": "..." },
      "text": "Hello world",
      "imageUrl": "/uploads/posts/filename.jpg",
      "likesCount": 5,
      "isLikedByMe": true,
      "commentCount": 3,
      "createdAt": "2026-03-01T10:00:00Z"
    }
  ],
  "totalPages": 10,
  "currentPage": 1
}
```

**POST /posts** — multipart/form-data
```
Fields: text (string), image (file)
Response: { "_id": "...", "text": "...", "imageUrl": "...", ... }
```

### Comment Routes

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/comments?postId=:id` | Yes | Get comments for a post |
| POST | `/comments` | Yes | Add comment |
| DELETE | `/comments/:id` | Yes (owner) | Delete comment |

**POST /comments**
```json
Request:  { "postId": "...", "text": "Great post!" }
Response: { "_id": "...", "postId": "...", "userId": { "_id": "...", "username": "john" }, "text": "Great post!", "createdAt": "..." }
```

### AI Route

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/ai/search` | Yes | Natural language post search |

**POST /ai/search**
```json
Request:  { "query": "photos of dogs at the beach" }
Response: { "posts": [ ...matched post objects... ] }
```

---

## 11. Success Criteria

### MVP Success Definition

The MVP is successful when a grader can:
1. Register and log in (username/password and Google).
2. Create a post with text and image, see it in the feed.
3. Like and comment on other posts.
4. Search posts using natural language and get relevant results.
5. Edit their profile photo and username.
6. Access the app via a public HTTPS URL on the college server.

### Functional Requirements
- ✅ Register, login, logout, Google OAuth all work end-to-end
- ✅ JWT access + refresh token flow works (session persists on page reload)
- ✅ Profile page shows user info and their posts
- ✅ Profile edit saves username and photo correctly
- ✅ Create/edit/delete post works, images display
- ✅ Main feed infinite scroll loads correctly
- ✅ Like/unlike toggles correctly with count update
- ✅ Comment count shows in feed; comments screen shows all comments
- ✅ AI search returns relevant posts for natural language queries
- ✅ All APIs documented in Swagger UI
- ✅ All API unit tests pass (Jest)
- ✅ App accessible via public HTTPS URL
- ✅ App stays running after terminal is closed (PM2)

### Quality Indicators
- TypeScript strict mode — no `any` unless unavoidable
- No `console.error` in production (proper error handling)
- Images served correctly (not broken links)
- Infinite scroll doesn't duplicate or skip posts

---

## 12. Implementation Phases

### Phase 1 — Backend Foundation + Auth (Week 1)

**Goal:** Working backend with auth, user model, and deployment scaffold.

Deliverables:
- ✅ Express + TypeScript project setup with Mongoose
- ✅ User model (username, passwordHash, profileImage, refreshTokens[])
- ✅ POST `/auth/register` + POST `/auth/login`
- ✅ JWT access + refresh token issuance and validation
- ✅ POST `/auth/refresh` + POST `/auth/logout`
- ✅ Google OAuth (Passport.js)
- ✅ Auth middleware
- ✅ Swagger setup
- ✅ Jest + Supertest configured
- ✅ Unit tests for auth routes

Validation: `POST /auth/login` returns valid tokens; refresh works; Swagger UI accessible.

---

### Phase 2 — Posts, Comments, Likes (Week 1–2)

**Goal:** Core content features fully functional.

Deliverables:
- ✅ Post model (userId, text, imageUrl, likesCount, likedBy, commentCount)
- ✅ Comment model (postId, userId, text)
- ✅ Multer middleware for image upload
- ✅ All post CRUD routes with owner-check middleware
- ✅ Paginated GET `/posts` (page + limit)
- ✅ Like/unlike routes (atomic update)
- ✅ Comment routes (add, list, delete)
- ✅ Swagger docs for posts and comments
- ✅ Unit tests for posts and comments

Validation: Create post with image → appears in paginated feed; like toggle updates count; comment appears in comments route.

---

### Phase 3 — Frontend + AI (Week 2–3)

**Goal:** Complete React app connected to backend; AI search working.

Deliverables:
- ✅ React + Vite + TypeScript + React Router setup
- ✅ Axios instance with token refresh interceptor
- ✅ Login / Register pages
- ✅ Google OAuth redirect handling
- ✅ AuthContext + protected routes
- ✅ Feed page with infinite scroll
- ✅ Post card component (like button, comment count badge)
- ✅ Create/Edit post form (with image upload)
- ✅ Comments page
- ✅ Profile page (view + edit)
- ✅ My Posts page / filter
- ✅ AI search bar on feed page
- ✅ Backend AI service + `/ai/search` route
- ✅ Swagger docs for AI route

Validation: Full user journey works end-to-end in browser; AI search returns sensible results.

---

### Phase 4 — Deployment & Polish (Week 3–4)

**Goal:** Production deployment on college server; all tests passing.

Deliverables:
- ✅ `vite build` → static files served
- ✅ HTTPS configured on college server (both frontend and backend)
- ✅ PM2 ecosystem config (`ecosystem.config.js`)
- ✅ MongoDB on college server with credentials in `.env`
- ✅ All unit tests passing in CI/locally
- ✅ Swagger UI accessible at `https://<server>/api-docs`
- ✅ Final review of all edge cases (owner checks, missing images, token expiry)
- ✅ Git history clean — small commits, PRs merged

Validation: Grader can access app from any browser via public URL; all features work over HTTPS.

---

## 13. Future Considerations

- **Follow system:** Users can follow each other; feed filtered by followed users.
- **Notifications:** In-app or push notifications for likes/comments on own posts.
- **Post search by tag:** Add hashtag support alongside AI search.
- **Image optimization:** Resize/compress uploaded images server-side (sharp).
- **Pagination improvements:** Cursor-based pagination for more consistent infinite scroll.
- **Facebook OAuth:** Second social login provider.
- **Rich text posts:** Markdown or basic formatting in post text.
- **Story/reel-style posts:** Time-limited content.

---

## 14. Risks & Mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| AI API rate limits exceeded | Medium | Cache AI responses server-side (TTL); avoid calling AI on every keystroke (debounce) |
| Image storage grows unbounded | Low | Delete old images when post/profile is updated or deleted; monitor disk usage |
| JWT refresh token not invalidated on logout | Medium | Store refresh tokens in DB; always delete on logout; check existence on refresh |
| Deployment config breaks on college server | Medium | Test locally with `NODE_ENV=production` before deploying; keep PM2 ecosystem file in repo |
| Unequal Git contribution visible to grader | Low | Agree on clear task split by domain (e.g., one person backend, one person frontend); review PRs each other's code |

---

## 15. Appendix

### Related Documents
- `AGENTS.md` — Backend coding standards (MVC, BaseController, REST, JWT, testing)
- `agentss.md` — Frontend coding standards (React FC, hooks, services, CSS Modules)

### Key Dependencies
- [Express](https://expressjs.com/) — Web framework
- [Mongoose](https://mongoosejs.com/) — MongoDB ODM
- [Passport.js](https://www.passportjs.org/) — OAuth
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) — JWT
- [multer](https://github.com/expressjs/multer) — File uploads
- [swagger-jsdoc](https://github.com/Surnet/swagger-jsdoc) + [swagger-ui-express](https://github.com/scottie1984/swagger-ui-express) — API docs
- [Jest](https://jestjs.io/) + [Supertest](https://github.com/ladjs/supertest) — Testing
- [PM2](https://pm2.keymetrics.io/) — Process manager
- [Vite](https://vitejs.dev/) — Frontend build
- [React Router v6](https://reactrouter.com/) — Client routing
- [Axios](https://axios-http.com/) — HTTP client

### Assumptions Made
1. **AI Provider:** Left as TBD — final choice (Gemini vs ChatGPT) will not affect architecture since it's abstracted in `ai.service.ts`.
2. **Email field:** Users have an email (required by Google OAuth) but it's not editable per assignment instructions.
3. **Anonymous browsing:** Not required — all routes require login.
4. **Comment editing:** Not mentioned in assignment — not included in MVP.
5. **Profile page visibility:** Any logged-in user can view any user's profile.
6. **Like implementation:** `likedBy[]` array + `likesCount` counter chosen for O(1) like status check and efficient count reads.
