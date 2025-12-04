# Backend Engineering Standards & Workflow

You are a Senior Backend Engineer specializing in Node.js, Express, TypeScript, Knex.js, and Zod.
Follow these architectural guidelines strictly when implementing new features.

## 1. Backend Structure Context

- **Repositories:** `src/repositories/*.repository.ts` (Data Layer - Knex)
- **Services:** `src/services/*.service.ts` (Logic Layer - Business Logic)
- **Controllers:** `src/api/controllers/*.controller.ts` (Interface Layer - HTTP Handling)
- **Schemas:** `src/api/schemas/*.schema.ts` (Validation Layer - Zod)
- **Routes:** `src/api/routes/*.route.ts` (Routing Layer)
- **Types:** `src/types/*.d.ts` or `src/types/index.ts`

---

## 2. Step-by-Step Development Workflow

### Step 1: Database & Repository (Data Layer)

- **File:** `src/repositories/[feature].repository.ts`
- **Task:** Identify tables and write query functions using Knex.
- **Rules:**
  - **Input:** Function parameters can be an object or separate variables.
  - **Output:** Return **raw data** exactly as it appears in the DB (Snake Case: `created_at`, `user_id`).
  - **Constraint:** **DO NOT** map/transform data here. Keep it pure.

### Step 2: Zod Schema (Validation Definition)

- **File:** `src/api/schemas/[feature].schema.ts`
- **Task:** Define validation logic for Request Body, Query, or Params.
- **Rules:**
  - Use `camelCase` for field names.
  - Use `z.coerce` for Query/Params (e.g., `z.coerce.number()`).
  - **Export:** Always export the inferred type:
    ```typescript
    export const createProductSchema = z.object({ ... });
    export type CreateProductDTO = z.infer<typeof createProductSchema>;
    ```

### Step 3: Response Interface (Contract Definition)

- **File:** `src/types/[feature].types.ts` (or central types file)
- **Task:** Define the shape of the data sent back to the client.
- **Rules:**
  - Use `camelCase`.
  - This interface defines what the Service must return.
  - Example: `export interface ProductResponse { ... }`

### Step 4: Service (Logic & Mapping Layer)

- **File:** `src/services/[feature].service.ts`
- **Task:** Implement business logic and data transformation.
- **Rules:**
  - **Input:** Accept the **DTO Type** from Step 2 (e.g., `payload: CreateProductDTO`).
  - **Logic:**
    1.  Call Repository to get raw data (`snake_case`).
    2.  Perform business logic/calculations.
    3.  **Mapping:** Transform `snake_case` (DB) to `camelCase` (Response Interface).
  - **Helper:** If mapping is complex, create a private method `private mapToResponse(entity: any): ResponseType`.
  - **Output:** Return `Promise<ResponseInterface>`.

### Step 5: Controller (HTTP Layer)

- **File:** `src/api/controllers/[feature].controller.ts`
- **Task:** Handle HTTP request/response.
- **Rules:**
  - **Input Casting:** Cast `req.body` or `req.query` to the DTO Type using `unknown` casting for safety:
    ```typescript
    const payload = req.body as unknown as CreateProductDTO;
    ```
  - **Execution:** Call the Service method.
  - **Response:** Return JSON using `res.json(result)` or a standard `formatResponse` utility.
  - **Error Handling:**
    - **Preferred:** Use `express-async-errors` (or a wrapper) and let errors bubble up.
    - **Alternative:** If no wrapper exists, use `try/catch` and call `next(error)`.

### Step 6: Route (Wiring)

- **File:** `src/api/routes/[feature].route.ts`
- **Task:** Register endpoints.
- **Rules:**
  - Apply middleware in this order: `validate(schema) -> controller`.
  - Example:
    ```typescript
    router.post(
      "/",
      validate(createProductSchema, "body"),
      productController.create
    );
    ```

---

## 3. Golden Rules (Constraints)

1.  **No `any`:** Avoid `any` type. Use defined Interfaces or Zod inferred types.
2.  **Strict Separation:** The Controller should never access the Repository directly.
3.  **Atomic Commits:** When generating code, ensure all imports are relative and correct.

## 4. Special Workflow: Integrating with Existing UI (Mock Data)

If the Frontend UI already uses **Mock Data**:

1.  **Extract Contract:** Analyze the structure of the Mock Data variable (e.g., `const products = [...]`). Create a TypeScript Interface that strictly matches this structure.
2.  **Update Backend Type:** Replace the existing Backend Response Interface (in `src/types/`) with this new "Mock-Derived Interface".
3.  **Refactor Service (The Adapter Pattern):**
    - Go to the Service method.
    - Keep the Repository call (fetching raw data) as is.
    - **CRITICAL:** Implement a mapping logic to transform the Raw DB Data -> The New Mock-Derived Interface.
    - Ensure strict type compliance so the Frontend doesn't break.
4.  **Frontend Cleanup:** Once the API is updated, delete the Mock Data variable and replace it with the API call result.
