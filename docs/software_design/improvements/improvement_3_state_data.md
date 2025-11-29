# Improvement 3: State Management & Data Handling

## 1. Form Handling with React Hook Form & Zod

**Problem:** Using `useState` for complex forms leads to excessive re-renders and verbose validation logic.
**Goal:** Simplify form state and validation.

### Setup

Install the necessary libraries:

```bash
npm install react-hook-form @hookform/resolvers zod
```

### Implementation Guide

1.  **Define the Schema (Zod):**
    Create a schema that defines the shape of your data and validation rules.

```tsx
// src/schemas/deliveryAddressSchema.ts
import { z } from "zod";

export const deliveryAddressSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  addressLine1: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  zipCode: z.string().regex(/^\d{5}$/, "Invalid ZIP code"),
  // ... other fields
});

export type DeliveryAddressFormData = z.infer<typeof deliveryAddressSchema>;
```

2.  **Create the Form Component:**

```tsx
// src/components/auction/DeliveryAddressForm.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  deliveryAddressSchema,
  DeliveryAddressFormData,
} from "../../schemas/deliveryAddressSchema";

export function DeliveryAddressForm({ onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DeliveryAddressFormData>({
    resolver: zodResolver(deliveryAddressSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="fullName">Full Name</Label>
        <Input id="fullName" {...register("fullName")} />
        {errors.fullName && (
          <span className="text-red-500 text-sm">
            {errors.fullName.message}
          </span>
        )}
      </div>

      {/* ... other fields ... */}

      <Button type="submit">Confirm Address</Button>
    </form>
  );
}
```

## 2. Managing Constants & Mock Data

**Problem:** Hardcoding data (like `transactionSteps`) inside components makes them hard to reuse and test.
**Goal:** Centralize static data.

### Action Plan

1.  **Create a Constants Directory:** `src/constants/` or `src/data/`.
2.  **Move Data:**

```tsx
// src/constants/transactionSteps.ts
import { CreditCard, Package, Truck, CheckCircle2 } from "lucide-react";

export const TRANSACTION_STEPS = [
  {
    id: 1,
    label: "Payment",
    icon: CreditCard,
    description: "Waiting for payment confirmation",
  },
  // ...
];
```

3.  **Import in Component:**

```tsx
import { TRANSACTION_STEPS } from "../../constants/transactionSteps";

// ... inside component
{TRANSACTION_STEPS.map(step => (
  // ... render step
))}
```

### Dynamic Data

For data that changes (like chat messages), ensure it comes from:

1.  **API:** Fetched via a hook (e.g., `useChatMessages(transactionId)`).
2.  **Props:** Passed down from a parent container that handles the fetching.
