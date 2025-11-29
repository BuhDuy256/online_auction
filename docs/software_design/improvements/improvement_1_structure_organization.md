# Improvement 1: Project Structure & Organization

## 1. Component Decomposition: Refactoring `TransactionRoom.tsx`

**Problem:** The `TransactionRoom.tsx` component is too large and handles too many responsibilities.
**Goal:** Break it down into smaller, focused components.

### Step-by-Step Refactoring Guide

1.  **Create a new directory:** `src/components/auction/transaction/`
2.  **Extract `TransactionStepper`:**

    - Create `src/components/auction/transaction/TransactionStepper.tsx`.
    - Move the `transactionSteps` array and the rendering logic for the progress bar and steps into this file.
    - **Props:** `currentStep` (number or status string).

3.  **Extract `ProductSummary`:**

    - Create `src/components/auction/transaction/ProductSummary.tsx`.
    - Move the product card rendering logic here.
    - **Props:** `product` (object containing name, image, price, etc.).

4.  **Extract `DeliveryAddressForm`:**

    - Create `src/components/auction/transaction/DeliveryAddressForm.tsx`.
    - Move the form state (`addressForm`) and the form JSX here.
    - **Props:** `onSubmit` (function), `initialValues` (optional).

5.  **Extract `TransactionChat`:**
    - Create `src/components/auction/transaction/TransactionChat.tsx`.
    - Move `chatMessages`, `message` state, and the chat UI here.
    - **Props:** `messages` (array), `onSendMessage` (function).

### Example: Refactored `TransactionRoom.tsx`

```tsx
import { TransactionStepper } from "./transaction/TransactionStepper";
import { ProductSummary } from "./transaction/ProductSummary";
import { DeliveryAddressForm } from "./transaction/DeliveryAddressForm";
import { TransactionChat } from "./transaction/TransactionChat";

export function TransactionRoom() {
  // ... state management for the parent container ...

  return (
    <div className="space-y-6">
      <Header />
      <ProductSummary product={productData} />
      <TransactionStepper currentStep={2} />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <PaymentDetails />
          <DeliveryAddressForm onSubmit={handleAddressSubmit} />
        </div>
        <div className="lg:col-span-1">
          <TransactionChat messages={messages} onSendMessage={handleSend} />
        </div>
      </div>
    </div>
  );
}
```

## 2. Feature-Based Folder Structure

**Problem:** Grouping by file type (`components`, `pages`) scales poorly as the app grows.
**Goal:** Group files by **feature** (domain).

### Proposed Structure

```
src/
├── features/               # Feature-based modules
│   ├── auction/            # Auction feature
│   │   ├── components/     # Components specific to auctions
│   │   │   ├── TransactionRoom.tsx
│   │   │   ├── BidForm.tsx
│   │   │   └── ...
│   │   ├── hooks/          # Hooks specific to auctions
│   │   │   └── usePlaceBid.ts
│   │   ├── services/       # API calls for auctions
│   │   │   └── auctionService.ts
│   │   └── types/          # TS types for auctions
│   │       └── index.ts
│   ├── auth/               # Authentication feature
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   └── ...
│   │   └── ...
│   └── user/               # User profile feature
│       └── ...
├── components/             # Shared / UI components (Buttons, Inputs, Layouts)
│   ├── ui/
│   └── common/
├── pages/                  # Route entry points (mostly just compose features)
│   ├── HomePage.tsx
│   └── ...
└── ...
```

### Migration Strategy

1.  Start by creating a `features` folder.
2.  Pick one isolated feature (e.g., `auth`) and move its related components, hooks, and services into `src/features/auth`.
3.  Update imports in other files.
4.  Repeat for other features like `auction` and `product`.
