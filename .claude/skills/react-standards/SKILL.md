---
name: react-standards
description: Enforces the project-specific React + TypeScript + Vite development standards defined in agentss.md for the front_b project. Use when creating or modifying React components, custom hooks, service files, or any frontend code in this project. Triggers on: writing components, creating hooks, adding API services, styling with CSS Modules, reviewing frontend code, or any task involving the React frontend codebase.
---

# React Standards — front_b Project

Stack: **React + TypeScript + Vite + Axios + Bootstrap 5.3 + CSS Modules**

---

## Project Structure

```
/src
  /componnents     - React components (*.tsx)
  /hooks           - Custom hooks (use*.ts)
  /services        - API services (api-client.ts, *-service.ts)
  /assets          - Static assets
  main.tsx         - Entry point
```

---

## Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Component files | PascalCase | `PostsList.tsx` |
| Hook files | camelCase + `use` prefix | `usePosts.ts` |
| Service files | kebab-case + suffix | `post-service.ts` |
| CSS Modules | ComponentName + `.module.css` | `ItemsList.module.css` |
| CSS classes | camelCase | `.container` |
| Variables/functions | camelCase | `setPosts`, `isLoading` |
| Interfaces | PascalCase | `Post`, `ItemsListProps` |
| Props interfaces | ComponentName + `Props` | `ItemsListProps` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRIES` |

**State variable naming:**
- Array data: plural noun (`posts`, `items`)
- Setters: `set` + name (`setPosts`)
- Booleans: `is` prefix (`isLoading`, `isVisible`)
- Error: `string | null` stored in `error`

**Function params:**
- Event handlers: `on` prefix (`onItemSelected`, `onClick`)
- Callbacks: `handle` prefix (`handleSubmit`)

---

## Component Template

```tsx
import { FC } from "react";

const ComponentName: FC = () => {
    // 1. Hooks first
    const { data, isLoading, error } = useCustomHook()

    // 2. Event handlers
    const handleClick = () => { }

    // 3. Render
    return (
        <div>
            {isLoading && <p>Loading...</p>}
            {error && <p>{error}</p>}
            {/* content */}
        </div>
    )
}

export default ComponentName
```

**Rules:** Use `FC` type. Default export at the bottom. Hooks always first.

**Props interface pattern:**
```tsx
interface ItemsListProps {
    onItemSelected: (index: number) => void
}
const ItemsList: FC<ItemsListProps> = ({ onItemSelected }) => { ... }
```

---

## Custom Hook Template

```typescript
const useCustomHook = () => {
    const [data, setData] = useState<Type[]>([]);
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(false)

    useEffect(() => {
        setIsLoading(true)
        const { request, abort } = dataService.getAll()
        request
            .then((res) => {
                setData(res.data)
                setIsLoading(false)
            })
            .catch((error) => {
                if (!(error instanceof CanceledError)) {
                    setError(error.message)
                    setIsLoading(false)
                }
            })
        return abort  // cleanup cancels in-flight requests
    }, [])

    return { data, setData, error, setError, isLoading, setIsLoading }
}

export default useCustomHook;
```

**Rules:** Always return state + setters. Explicit TypeScript types on all state. Return `abort` as useEffect cleanup. Handle `CanceledError` separately (don't show error on unmount).

---

## Service Template

```typescript
import apiClient, { CanceledError } from "./api-client"

export { CanceledError }   // re-export for use in hooks

export interface DataType {
    _id: string,            // MongoDB uses _id, not id
    // other fields
}

const getAll = () => {
    const abortController = new AbortController()
    const request = apiClient.get<DataType[]>("/endpoint",
        { signal: abortController.signal })
    return { request, abort: () => abortController.abort() }
}

export default { getAll }
```

**Rules:** Always re-export `CanceledError`. Always export interfaces. Always return `{ request, abort }`. Use `AbortController` on every request. Use `_id` (MongoDB convention).

---

## API Client (`services/api-client.ts`)

```typescript
import axios, { CanceledError } from "axios";

export { CanceledError };

const apiClient = axios.create({
    baseURL: "http://localhost:4040",
});

export default apiClient;
```

Single centralized instance. Never create additional axios instances.

---

## Error Handling Pattern

```typescript
request
    .then((res) => {
        setData(res.data)
        setIsLoading(false)
    })
    .catch((error) => {
        if (!(error instanceof CanceledError)) {
            setError(error.message)
            setIsLoading(false)
        }
    })
```

Set `isLoading(false)` in both `.then` and `.catch`. Skip error state on `CanceledError`.

---

## Styling

- **CSS Modules** for component-specific styles: `import styles from './Component.module.css'`
- Class names: camelCase (`.container`, `.listItem`)
- **Bootstrap 5.3** for layout and utility classes — prefer Bootstrap first, override with CSS Modules

---

## TypeScript Rules

- Always type `useState` explicitly: `useState<Post[]>([])`, `useState<string | null>(null)`
- Type function parameters and returns
- Use generics for API calls: `apiClient.get<Post[]>("/posts")`
- Strict mode enabled — no implicit `any`
- Interfaces over type aliases for data models

---

## Dependencies

| Package | Purpose |
|---------|---------|
| axios | HTTP client |
| react-hook-form + zod | Form validation |
| bootstrap | UI framework |
| @fortawesome/react-fontawesome | Icons |

---