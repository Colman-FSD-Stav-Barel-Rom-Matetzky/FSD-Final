# Express Standards – Full Reference

## Table of Contents
1. [BaseController Pattern](#1-basecontroller-pattern)
2. [Model Definition](#2-model-definition)
3. [Routes](#3-routes)
4. [API Design](#4-api-design)
5. [Authentication & Security](#5-authentication--security)
6. [Error Handling](#6-error-handling)
7. [Testing](#7-testing)
8. [Swagger Documentation](#8-swagger-documentation)
9. [Naming Conventions](#9-naming-conventions)
10. [DO / DON'T Checklist](#10-do--dont-checklist)

---

## 1. BaseController Pattern

```typescript
// src/controllers/baseController.ts
class BaseController {
    model: any;
    constructor(dataModel: any) { this.model = dataModel; }

    async get(req, res) {
        try {
            const items = await this.model.find(req.query);
            res.json(items);
        } catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
        }
    }
    async getById(req, res) { /* find by req.params.id */ }
    async post(req, res) { /* create, return 201 */ }
    async put(req, res) { /* findByIdAndUpdate */ }
    async del(req, res) { /* findByIdAndDelete */ }
}

// src/controllers/movieController.ts
import Movie from "../model/movieModel";
import BaseController from "./baseController";

class MovieController extends BaseController {
    constructor() { super(Movie); }

    // Override ONLY when adding custom logic
    async post(req, res) {
        req.body.createdBy = req.user._id;   // inject authenticated user
        return super.post(req, res);
    }
}

export default new MovieController();
```

---

## 2. Model Definition

```typescript
// src/model/movieModel.ts
import mongoose from "mongoose";

const movieSchema = new mongoose.Schema({
    title:      { type: String, required: true },
    releaseYear:{ type: Number },
    createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
});

export default mongoose.model("movie", movieSchema);  // lowercase singular name
```

---

## 3. Routes

```typescript
// src/routes/movieRoutes.ts
import express from "express";
import movieController from "../controllers/movieController";
import authMiddleware from "../middleware/authMiddleware";

const router = express.Router();

/**
 * @swagger
 * /movie:
 *   get:
 *     summary: Get all movies
 *     tags: [Movie]
 *     security: []
 *     responses:
 *       200:
 *         description: List of movies
 */
router.get("/",    movieController.get.bind(movieController));
router.get("/:id", movieController.getById.bind(movieController));
router.post("/",   authMiddleware, movieController.post.bind(movieController));
router.put("/:id", authMiddleware, movieController.put.bind(movieController));
router.delete("/:id", authMiddleware, movieController.del.bind(movieController));

export default router;
```

Register in `src/index.ts`:
```typescript
import movieRoutes from "./routes/movieRoutes";
app.use("/movie", movieRoutes);
```

---

## 4. API Design

### Standard CRUD Endpoints

| Method | Endpoint        | Auth | Status |
|--------|----------------|------|--------|
| GET    | `/{resource}`   | No   | 200    |
| GET    | `/{resource}/:id` | No | 200  |
| POST   | `/{resource}`   | Yes  | 201    |
| PUT    | `/{resource}/:id` | Yes | 200  |
| DELETE | `/{resource}/:id` | Yes | 200  |

### Response Format

```json
// Success
{ "data": { /* object or array */ } }

// Error
{ "error": "Descriptive message" }
```

### HTTP Status Codes
- 200 — successful GET / PUT
- 201 — successful POST
- 400 — validation error
- 401 — missing / invalid token
- 403 — insufficient permissions
- 404 — resource not found
- 500 — server error

### Query Parameters
Filters passed as query params: `GET /movie?title=Inception`. Controller handles via `req.query`.

---

## 5. Authentication & Security

### JWT Dual-Token System
```typescript
// .env.dev
JWT_SECRET=secretkey
JWT_EXPIRES_IN=3600        // 1 hour
JWT_REFRESH_EXPIRES_IN=86400 // 24 hours
```

Auth flow:
1. `POST /auth/register` or `POST /auth/login` -> receive `{ accessToken, refreshToken }`
2. Protected routes: `Authorization: Bearer {accessToken}` header
3. `POST /auth/refresh` with refresh token -> new access token

### Applying Auth Middleware
```typescript
router.post("/movie", authMiddleware, movieController.post.bind(movieController));
```

### Password Security
- Bcrypt with salt rounds = 10
- Never store plain-text passwords
- Never expose password field in responses

### CORS
```typescript
res.header("Access-Control-Allow-Origin", "*");
res.header("Access-Control-Allow-Headers", "*");
res.header("Access-Control-Allow-Methods", "*");
```

---

## 6. Error Handling

```typescript
// Standard helper
const sendError = (res: Response, message: string, code = 400) => {
    res.status(code).json({ error: message });
};

// In every async controller method
async method(req, res) {
    try {
        if (!req.body.field) return sendError(res, "field is required", 400);
        const result = await this.model.find();
        res.json(result);
    } catch (error) {
        res.status(500).json({
            error: error instanceof Error ? error.message : 'An unknown error occurred'
        });
    }
}
```

Rules:
- Every async handler has try-catch
- Validate required fields at the start; return early with `sendError`
- Use specific status codes (400, 401, 403, 404) — not always 500

---

## 7. Testing

### Structure
```typescript
// src/tests/movie.test.ts
import request from "supertest";
import app from "../index";

describe('Movie', () => {
    beforeAll(async () => { /* connect to test DB */ });
    afterAll(async () => { /* close connections */ });

    test('GET /movie returns 200', async () => {
        const res = await request(app).get('/movie');
        expect(res.status).toBe(200);
    });
});
```

### Commands
```bash
npm test              # all tests
npm run testauth      # auth tests
npm run testmovie     # movie tests
npm run testcomment   # comment tests
npm run testmulter    # file upload tests
```

### Jest Config (jest.config.ts)
- `--runInBand` — sequential execution
- `--detectOpenHandles` — find unclosed async operations
- `--forceExit` — ensure tests terminate

---

## 8. Swagger Documentation

Every route needs a JSDoc `@swagger` block. Define reusable schemas in `src/swagger.ts`.

```typescript
/**
 * @swagger
 * /movie/{id}:
 *   get:
 *     summary: Get movie by ID
 *     description: Returns a single movie
 *     tags: [Movie]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Movie found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movie'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get("/:id", movieController.getById.bind(movieController));
```

Schema definition in `swagger.ts`:
```typescript
components: {
    schemas: {
        Movie: {
            type: 'object',
            properties: {
                _id:         { type: 'string' },
                title:       { type: 'string' },
                releaseYear: { type: 'number' },
                createdBy:   { type: 'string' }
            }
        }
    }
}
```

Endpoints: Swagger UI at `/api-docs`, JSON spec at `/api-docs.json`.

---

## 9. Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Files | camelCase | `movieController.ts` |
| Classes | PascalCase | `MovieController` |
| DB model name | lowercase singular | `"movie"` |
| Variables/functions | camelCase | `generateToken` |
| Constants (env) | UPPER_SNAKE_CASE | `JWT_SECRET` |
| Interfaces/Types | PascalCase | `AuthRequest` |
| Route collections | plural nouns | `/movies` |
| Multi-word routes | kebab-case | `/api-docs` |

---

## 10. DO / DON'T Checklist

### DO
- Extend `BaseController` for standard CRUD
- Use `authMiddleware` on protected routes
- Document all routes with `@swagger` JSDoc
- Handle errors with try-catch in all async functions
- Use TypeScript types/interfaces everywhere
- Store secrets in environment variables
- Hash passwords with bcrypt (salt rounds = 10)
- Write tests for all features
- Bind controller methods in routes: `.bind(controller)`

### DON'T
- Don't put business logic in routes
- Don't put DB queries in routes
- Don't expose sensitive data (passwords, tokens) in responses
- Don't commit `.env` files
- Don't skip error handling
- Don't bypass auth on sensitive routes
- Don't use `any` type unless absolutely necessary
- Don't mix auth logic with business logic
