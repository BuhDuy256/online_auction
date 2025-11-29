# Improvement 4: Testing Strategy

## 1. Unit & Integration Testing (Vitest + React Testing Library)

**Goal:** Ensure individual components work as expected.

### Setup

Since you are using Vite, **Vitest** is the natural choice.

```bash
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom
```

### Configuration

1.  **Update `vite.config.ts`:**

```ts
/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
  },
});
```

2.  **Create Setup File (`src/test/setup.ts`):**

```ts
import "@testing-library/jest-dom";
```

### Writing Your First Test

Create a test file next to your component, e.g., `src/components/ui/Button.test.tsx`.

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "./button";
import { describe, it, expect, vi } from "vitest";

describe("Button Component", () => {
  it("renders correctly", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("handles click events", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText("Click me"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Running Tests

Add a script to `package.json`:

```json
"test": "vitest"
```

Run `npm test`.

## 2. End-to-End (E2E) Testing

**Goal:** Verify critical user flows (e.g., "User can log in and place a bid").

### Recommended Tool: Playwright

It's fast, reliable, and works well with modern web apps.

### Setup

```bash
npm init playwright@latest
```

### Example Test (`tests/transaction.spec.ts`)

```ts
import { test, expect } from "@playwright/test";

test("User can view transaction room", async ({ page }) => {
  await page.goto("http://localhost:5173/login");

  // Login flow
  await page.fill('input[name="email"]', "buyer@example.com");
  await page.fill('input[name="password"]', "password123");
  await page.click('button[type="submit"]');

  // Navigate to transaction
  await page.goto("http://localhost:5173/transaction-room");

  // Verify element existence
  await expect(page.getByText("Transaction Room")).toBeVisible();
  await expect(page.getByText("$1,400")).toBeVisible();
});
```
