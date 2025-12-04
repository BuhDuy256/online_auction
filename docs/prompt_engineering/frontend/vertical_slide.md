# Phase 0: Contract & Gap Analysis

Role: Senior Full-stack Architect

Context: I am building the feature **[TÊN TÍNH NĂNG, VD: User Profile]**.
Resources: `@db_init.sql`, `@backend_guide.md`, `[TÊN FILE UI MOCKUP HIỆN TẠI]`.

Task: Gap Analysis & Contract Definition

**DO NOT WRITE IMPLEMENTATION CODE YET.**
Instead, act as a consultant to prepare the roadmap.

1. **Gap Analysis (UI vs DB):**

   - Compare `[UI File]` fields against `@db_init.sql` columns.
   - Create a table listing: **UI Field** | **DB Column** | **Status** (Matched / Missing / Mismatch).
   - _Example:_ `Avatar` | `None` | `Missing`.

2. **Clarification Questions:**

   - Based on the missing/mismatch items, propose a solution for each (e.g., "Should we delete the Avatar UI or use a fallback?").
   - Ask about Edge Cases (Loading, Error, Empty states).

3. **Proposed API Contract:**
   - Draft the JSON Response structure that matches the DB columns.

Output Requirement

Output the **Gap Analysis Table**, **Proposed Solutions/Questions**, and **Draft API JSON**.
Then STOP and wait for my approval/answers.

# Phase 1: Backend Implementation

Context: We agreed on the API Contract above.
Task: Implement the Backend logic for **[TÊN TÍNH NĂNG]**.

Requirements:

1. **Database:** Write the SQL Query to handle this data.
2. **Service/Controller:** Implement the endpoint in `[TÊN FILE BACKEND]`.
3. **Data Mapping:** Ensure the API response matches the JSON structure we defined in Phase 0.
4. **Validation:** Ensure input validation matches `[FILE DATABASE]`.

Output: Code for backend which follow `[FILE BACKEND GUIDE]`.

# Phase 2: Frontend Logic Layer

Context: The Backend API is ready.
Task: Implement the Frontend connection logic.

Requirements (Follow `Frontend Development Guide`):

1. **Types:** Update `src/types/[feature].ts`.
2. **Hook:** Create/Update `src/hooks/use[Feature].ts`.
   - **Crucial:** Implement a `transformData` function inside the hook.
   - If API returns `user_addr` but UI expects `address`, map it here.
   - If API misses a field (e.g., `status`), calculate it here if possible.

Output: Code for frontend which follow `[FILE FRONTEND GUIDE]`.

# Phase 3: Frontend UI Integration

Context: The `use[Feature]` hook is ready.
Task: Integrate the Real Data into `[TÊN COMPONENT UI]`.

**⛔️ STRICT CONSTRAINTS (UI PRESERVATION):**

1. **Pixel-Perfect Preservation:** Do NOT change the existing JSX structure, wrapper `div`s, or Tailwind classes.
2. **Data Swap Only:** Only replace `mockData.x` with `realData.x`.

**⚠️ EXCEPTION HANDLING (MISMATCHES):**
Based on the Gap Analysis in Phase 0, handle these specific cases:

[CHỈNH SỬA THEO NHƯ AI HỎI, DƯỚI ĐÂY LÀ VÍ DỤ]

- **Case 1: Missing Image/Avatar** (UI has it, DB doesn't):
  - **Action:** Remove the `<Avatar>` or `<img>` tag.
  - **Fallback:** Replace it with a text-based display (e.g., user initials or address) fitting the same container.
- **Case 2: Missing Stats/Views** (UI has it, DB doesn't):
  - **Action:** Completely remove the specific `div` or `span` displaying this stat.
- **Case 3: Loading State:**
  - Keep the existing UI layout but verify data existence (`if (!data) return <Skeleton />`) before rendering specific sections.

Output: The Refactored Component Code.
