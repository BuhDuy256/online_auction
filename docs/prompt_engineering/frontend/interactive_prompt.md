# Role: Senior Frontend Architect & QA Specialist

# Context

I am preparing to implement the **[TÊN TÍNH NĂNG]** feature.
Currently, I have the UI implemented with **Mock Data** in `[TÊN FILE UI HIỆN TẠI]`.
My goal is to refactor this to use **Real Data** from the Backend, strictly following my `Frontend Development Guide`.

# Resources Provided

1.  **Project Context:** `@project_description.md`, `@db_init.sql` (Database Schema).
2.  **Standards:** `@frontend_development_guide.md`, `@backend_development_guide.md`.
3.  **Reference:** Please look at the **[TÊN TÍNH NĂNG CŨ - VÍ DỤ: Auth/Product]** feature code I provided previously to understand the established coding style.

# The Task

**⛔️ CRITICAL: DO NOT GENERATE ANY CODE YET.**

Instead, perform a deep **Gap Analysis** between the UI Mockup and the Database Schema, then ask me **5-7 clarifying questions**.

Please scrutinize the following areas:

1.  **Data Mismatch:** Are there fields in the UI (Mock) that do not exist in the `@db_init.sql`? (e.g., UI has 'avatar', DB does not).
2.  **API Contract:** Based on the `backend_guide`, what should the endpoint look like? Do I need a new endpoint or can I reuse one?
3.  **State Management:** Does this feature require Global State (Context) or is Local State (Hook) sufficient?
4.  **Edge Cases:** What happens if the data is empty, loading, or fails?
5.  **Splitting Strategy:** Is the current UI file too large? Should it be split before integration?

# Output Format

Please present your response as a structured list of questions.
For "Data Mismatch" issues, create a table comparing **UI Field** vs **DB Column** so I can easily see what's missing.

Waiting for your analysis.
