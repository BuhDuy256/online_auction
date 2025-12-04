# Backend Engineering Standards & Workflow

You are a Senior Backend Engineer specializing in Node.js, Express, TypeScript, Knex.js, and Zod.
Follow these architectural guidelines strictly when implementing new features.

## 1. Project Structure & Architecture

```
backend/src/
├── api/
│   ├── controllers/          # HTTP request handlers
│   ├── routes/              # Route definitions
│   ├── schemas/             # Zod validation schemas (legacy)
│   ├── dtos/
│   │   ├── requests/        # Request validation schemas (Zod)
│   │   └── responses/       # Response type definitions
│   └── middlewares/         # Express middlewares
├── services/                # Business logic layer
├── repositories/            # Data access layer (Knex queries)
├── mappers/                 # Data transformation functions
├── database/                # Database connection & migrations
├── utils/                   # Utility functions
├── configs/                 # Configuration files
├── types/                   # Global TypeScript type definitions
└── errors/                  # Custom error classes
```

### Architecture Layers

```
HTTP Request
    ↓
[Route] → [Middleware] → [Controller] → [Service] → [Repository] → Database
                              ↓             ↓
                          [Mapper]    [Mapper]
                              ↓
HTTP Response
```

---

## 2. Folder-by-Folder Standards

### 📁 `api/dtos/requests/` - Request Validation Schemas

**Purpose:** Define and validate incoming request data using Zod.

**File naming:** `[feature].schema.ts`

**Rules:**

- Use `camelCase` for all field names
- Export both schema and inferred type
- Use `z.coerce` for query/params
- Add descriptive error messages

**Constraints:**

- ✅ Must export schema and type
- ✅ Must use `camelCase`
- ❌ No `snake_case`
- ❌ No business logic

---

### 📁 `api/dtos/responses/` - Response Type Definitions

**Purpose:** Define the shape of data returned to clients.

**File naming:** `[feature].type.ts`

**Rules:**

- Use `camelCase` for all fields
- Define interfaces for response structures
- No `message` field (message is wrapper-level via `res.message()`)

**Constraints:**

- ✅ Must use `camelCase`
- ✅ Must match Service return type
- ❌ No `snake_case`
- ❌ No `message` field in data

---

### 📁 `repositories/` - Data Access Layer

**Purpose:** Execute database queries using Knex. Pure data access only.

**File naming:** `[feature].repository.ts`

**Rules:**

- Return raw database records in `snake_case`
- Use Knex query builder
- Add JSDoc comments for complex queries
- No data transformation or business logic

**Constraints:**

- ✅ Must return raw DB data (`snake_case`)
- ✅ Must add JSDoc for clarity
- ❌ No data transformation
- ❌ No business logic
- ❌ No `camelCase` conversion

---

### 📁 `mappers/` - Data Transformation Layer

**Purpose:** Transform data between DB format (`snake_case`) and API format (`camelCase`).

**File naming:** `[feature].mapper.ts`

**Rules:**

- Pure transformation functions only
- Convert `snake_case` → `camelCase`
- Return exact Response type from DTOs
- Handle nested objects and arrays

**Constraints:**

- ✅ Must be pure functions
- ✅ Must convert `snake_case` → `camelCase`
- ✅ Must return Response type
- ❌ No database calls
- ❌ No business logic

---

### 📁 `services/` - Business Logic Layer

**Purpose:** Orchestrate business operations, coordinate repositories and mappers.

**File naming:** `[feature].service.ts`

**Rules:**

- Accept DTO types as input (from request schemas)
- Call repositories to get raw data
- Apply business logic and validations
- Use mappers to transform `snake_case` → `camelCase`
- Return `Promise<ResponseType>` (explicit type required)
- Throw custom errors for business rule violations

**Constraints:**

- ✅ Must return `Promise<ResponseType>`
- ✅ Must use mappers for transformation
- ✅ Must have explicit return types
- ✅ Must throw custom errors
- ❌ No direct DB queries
- ❌ No inline mapping
- ❌ No `any` return types

---

### 📁 `api/controllers/` - HTTP Request Handlers

**Purpose:** Handle HTTP requests, call services, return responses.

**File naming:** `[feature].controller.ts`

**Rules:**

- Cast request data to DTO types (`req.body as SchemaType`)
- Call service methods
- Use `res.message()` for success messages (wrapper-level)
- Use `res.status().json()` to send response
- Pass errors to `next(error)` for middleware handling
- Return `Promise<void>`

**Constraints:**

- ✅ Must use `res.message()` (not in data)
- ✅ Must call `next(error)`
- ✅ Must cast request data
- ✅ Must return `Promise<void>`
- ❌ No business logic
- ❌ No repository access
- ❌ No `message` in data

---

### 📁 `api/routes/` - Route Definitions

**Purpose:** Register endpoints and wire middleware to controllers.

**File naming:** `[feature].route.ts`

**Rules:**

- Apply middleware chain: `validation → controller`
- Group related endpoints
- Export router

**Constraints:**

- ✅ Must apply validation first
- ✅ Must group related routes
- ❌ No business logic

---

## 3. Response Format Standards

### Success Response (Automatic by Middleware)

```typescript
// Controller code:
res.status(200).message("Success message").json(data);

// Actual response:
{
  "success": true,
  "data": { ...actual data... },
  "message": "Success message"  // Optional, from res.message()
}
```

### Error Response (Handled by Error Middleware)

```typescript
{
  "success": false,
  "error": "Error type",
  "message": "Human readable message",
  "details": { ...error details... }  // Optional
}
```

---

## 4. Step-by-Step Development Workflow

### Step 1: Define Request Schema

**File:** `api/dtos/requests/[feature].schema.ts`

- Create Zod schema with `camelCase`
- Export schema and inferred type

### Step 2: Define Response Types

**File:** `api/dtos/responses/[feature].type.ts`

- Define interfaces in `camelCase`
- No `message` field (wrapper-level)

### Step 3: Create Repository

**File:** `repositories/[feature].repository.ts`

- Write Knex queries
- Return raw `snake_case` data
- Add JSDoc comments

### Step 4: Create Mapper

**File:** `mappers/[feature].mapper.ts`

- Pure transformation functions
- Convert `snake_case` → `camelCase`
- Return Response type

### Step 5: Implement Service

**File:** `services/[feature].service.ts`

- Accept Schema type as input
- Call repository, apply business logic
- Use mapper to transform data
- Return `Promise<ResponseType>`

### Step 6: Implement Controller

**File:** `api/controllers/[feature].controller.ts`

- Cast `req.body` to Schema type
- Call service method
- Use `res.message()` and `res.json()`
- Pass errors to `next(error)`

### Step 7: Register Route

**File:** `api/routes/[feature].route.ts`

- Apply validation middleware
- Wire to controller

---

## 5. Golden Rules (Critical Constraints)

### Separation of Concerns

1. **Repository** → Only database queries, returns `snake_case`
2. **Mapper** → Only data transformation, no logic
3. **Service** → Business logic + orchestration, returns `camelCase`
4. **Controller** → HTTP handling only, no business logic

### Type Safety

1. ✅ **No `any` types** - Use explicit interfaces or Zod inferred types
2. ✅ **Service must return `Promise<ResponseType>`** - All async methods need explicit return types
3. ✅ **Controller must cast request data** - `req.body as SchemaType`
4. ❌ **No `any` in return types** - Always specify what you return

### Data Flow

1. ✅ **Request (camelCase)** → Schema validates
2. ✅ **Service converts to snake_case** → Pass to Repository
3. ✅ **Repository returns snake_case** → Raw DB data
4. ✅ **Mapper converts to camelCase** → Clean response
5. ✅ **Controller sends via `res.json()`** → Middleware wraps

### Naming Conventions

| Layer           | Case       | Example              |
| --------------- | ---------- | -------------------- |
| Request Schema  | camelCase  | `categoryId`         |
| Database (Knex) | snake_case | `category_id`        |
| Response Type   | camelCase  | `categoryId`         |
| File names      | kebab-case | `product.service.ts` |

### Message Handling

1. ✅ **Use `res.message()`** for success messages (wrapper level)
2. ❌ **Don't put `message` in response data** (it's automatic)
3. ✅ **Error messages** are handled by error middleware

```typescript
// ✅ Correct
res.message("Created successfully").json(data);
// Response: { success: true, data: {...}, message: "Created successfully" }

// ❌ Wrong
res.json({ ...data, message: "Created successfully" });
// Response: { success: true, data: { ...data, message: "..." } }
```

### Import Rules

1. ✅ Use relative imports within src: `"../repositories/product.repository"`
2. ✅ Import types from DTOs: `import { ProductResponse } from "../api/dtos/responses/product.type"`
3. ✅ Import schemas from requests: `import { CreateProductSchema } from "../api/dtos/requests/product.schema"`

---

## 6. Common Patterns

### Pattern 1: Create Operation

- Repository: Insert with `snake_case`, return raw
- Mapper: Transform to `camelCase`
- Service: Convert input → `snake_case` → call repo → mapper → return
- Controller: Cast body → service → `res.message()` → `res.json()`

### Pattern 2: List with Pagination

- Repository: Return `{ data, total }`
- Mapper: Transform array + metadata
- Service: Call repo → mapper with pagination
- Controller: Extract query params → service → `res.json()`

### Pattern 3: Error Handling

- Service: Throw custom errors (NotFoundError, BadRequestError)
- Controller: Catch and pass to `next(error)`
- Middleware: Auto-format error response

---

## 7. Checklist for New Features

When implementing a new feature, verify:

- [ ] **Request Schema** defined in `api/dtos/requests/` with `camelCase`
- [ ] **Response Type** defined in `api/dtos/responses/` with `camelCase`
- [ ] **Repository** returns raw `snake_case` data, no transformation
- [ ] **Mapper** created in `mappers/` for `snake_case` → `camelCase`
- [ ] **Service** returns `Promise<ResponseType>`, uses mapper
- [ ] **Controller** uses `res.message()` for messages, not in data
- [ ] **Controller** casts request data to schema type
- [ ] **Route** applies validation middleware before controller
- [ ] **No `any` types** used anywhere
- [ ] **Error handling** uses custom errors (NotFoundError, BadRequestError, etc.)

---

## 8. Migration Guide: Integrating with Existing Frontend (Mock Data)

If frontend uses mock data:

1. **Extract Contract**: Analyze mock data structure, create matching interface
2. **Update Response Type**: Use frontend-derived interface in `responses/`
3. **Refactor Mapper**: Adapt DB fields → Frontend fields
4. **Frontend Cleanup**: Replace mock with API calls

---

## 9. Quick Reference

### File Structure for Feature

```
api/dtos/requests/[feature].schema.ts    # Zod schemas
api/dtos/responses/[feature].type.ts     # Response interfaces
api/controllers/[feature].controller.ts  # HTTP handlers
api/routes/[feature].route.ts            # Routes
services/[feature].service.ts            # Business logic
repositories/[feature].repository.ts     # DB queries
mappers/[feature].mapper.ts              # Transformations
```

### Return Type Signatures

```typescript
// Repository: raw DB data
(params) => Promise<any> | any

// Mapper: transformed data
(raw: any) => ResponseType

// Service: explicit Response type
(params) => Promise<ResponseType>

// Controller: void
(req, res, next) => Promise<void>
```
