---
name: express-standards
description: >
  Project-specific development standards for an Express + TypeScript + MongoDB backend.
  Encodes the conventions from AGENTS.md: MVC architecture with a BaseController pattern,
  folder structure, naming conventions, REST API design, JWT dual-token auth, error handling,
  Jest/Supertest testing, and Swagger documentation.
  Use whenever writing, reviewing, or extending Express backend code in this project,
  adding a new resource (model/controller/route/test), or when the user asks about
  project conventions, coding standards, or how to implement features in the backend.
---

# Express Development Standards

This project's backend is **Express + TypeScript + Mongoose (MongoDB)**.
Full standards with code examples are in [references/standards.md](references/standards.md).

## Quick Reference

### Architecture: MVC + BaseController
- `BaseController` provides generic CRUD (`get`, `getById`, `post`, `put`, `del`)
- Specific controllers extend `BaseController`; override only when adding custom logic
- Routes only wire endpoints to controllers + middleware — no business logic anywhere else

### Folder Structure
```
src/
  index.ts               # App config & initialization
  server.ts              # Entry point
  swagger.ts             # Swagger config
  controllers/
    baseController.ts
    {resource}Controller.ts
  middleware/
    {purpose}Middleware.ts
  model/
    {resource}Model.ts
  routes/
    {resource}Routes.ts
  tests/
    {resource}.test.ts
    testUtils.ts
```

### Adding a New Resource (checklist)
1. `src/model/{resource}Model.ts` — Mongoose schema
2. `src/controllers/{resource}Controller.ts` — extends `BaseController`
3. `src/routes/{resource}Routes.ts` — REST endpoints + Swagger JSDoc
4. Register in `src/index.ts`: `app.use("/{resource}", {resource}Routes)`
5. `src/tests/{resource}.test.ts` — Jest + Supertest

### Key Rules
- **Naming**: files camelCase (`movieController.ts`), classes PascalCase (`MovieController`), DB models lowercase singular (`"movie"`)
- **Routes**: plural nouns for collections (`/movies`), kebab-case for multi-word (`/api-docs`)
- **Responses**: `{ data: ... }` on success, `{ error: "..." }` on failure
- **Auth**: JWT dual-token (access + refresh); protect routes with `authMiddleware`
- **Errors**: try-catch in every async handler; use `sendError(res, message, code)`
- **Docs**: every route MUST have a `@swagger` JSDoc block

## Detailed Standards
Read [references/standards.md](references/standards.md) for full code patterns, HTTP status codes,
auth flow, testing patterns, Swagger templates, and the complete DO/DON'T checklist.
