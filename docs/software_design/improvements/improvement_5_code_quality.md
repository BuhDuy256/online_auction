# Improvement 5: Code Quality & Tooling

## 1. Absolute Imports (Path Aliases)

**Problem:** Deep relative imports like `../../../../components/ui/button` are hard to read and break when you move files.
**Goal:** Use clean imports like `@/components/ui/button`.

### Configuration

1.  **Update `tsconfig.json`:**
    Add `baseUrl` and `paths` to `compilerOptions`.

```json
{
  "compilerOptions": {
    // ...
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

2.  **Update `vite.config.ts`:**
    You might need `vite-tsconfig-paths` or manually resolve the alias.

```ts
import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

3.  **Usage:**
    Now you can import from anywhere:
    ```tsx
    import { Button } from "@/components/ui/button";
    ```

## 2. Eliminating Magic Strings

**Problem:** Hardcoded strings (e.g., "TXN-89234", status codes "pending") are error-prone.
**Goal:** Use Enums or Constants.

### Implementation

1.  **Create `src/constants/enums.ts`:**

```ts
export enum TransactionStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  UPCOMING = "upcoming",
  CANCELLED = "cancelled",
}

export enum UserRole {
  BUYER = "buyer",
  SELLER = "seller",
  ADMIN = "admin",
}
```

2.  **Refactor Components:**

```tsx
// BEFORE
if (step.status === "completed") { ... }

// AFTER
import { TransactionStatus } from "@/constants/enums";

if (step.status === TransactionStatus.COMPLETED) { ... }
```

### Mock Data Generators

For things like Transaction IDs, use a utility function instead of a hardcoded string.

```ts
// src/utils/formatters.ts
export const generateTransactionId = () =>
  `TXN-${Math.floor(Math.random() * 100000)}`;
```
