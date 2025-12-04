````markdown
# 🧠 Development Guide – Bộ Tiêu Chí Đánh Giá (Bản Dùng Cho AI Khác)

Mục đích của tài liệu này:

- Dùng làm **khung đánh giá** cho một file hướng dẫn phát triển dành cho AI (ví dụ: `MASTER_INSTRUCTIONS.md`, `DEVELOPMENT_GUIDE.md`).
- Đảm bảo AI:
  - Hiểu đúng **bối cảnh dự án** (context).
  - Tuân thủ **kiến trúc & convention** sẵn có.
  - Hạn chế tối đa việc **bịa code, bịa file, hoặc phá cấu trúc**.

---

## 0. Khung Tổng Thể – Development Guide “Đạt Chuẩn” Là Gì?

Một Development Guide được xem là đủ tốt khi nó có:

- **5 Trụ Cột (The 5 Pillars)**:

  1. Role & Tech Stack (Định danh & Công nghệ)
  2. The Map (Sơ đồ thư mục & Quy tắc đặt tên)
  3. The Workflow (Luồng xử lý dữ liệu)
  4. The Constraints (Luật cấm & Quy ước)
  5. Few-Shot Examples (Ví dụ code mẫu)

- **Hệ thống Integration Scenarios (Kịch bản áp dụng)**:

  - Scenario A – Greenfield (tính năng mới hoàn toàn)
  - Scenario B – Mock Data / UI-first
  - Scenario C – Refactor
  - (Tuỳ chọn) Scenario D – Bugfix / Debug
  - (Tuỳ chọn) Scenario E – Add Tests

- **Một checklist cuối cùng** để rà nhanh xem Guide đã bao phủ đủ các yếu tố quan trọng hay chưa.

Phần dưới đây mô tả chi tiết **tiêu chí đánh giá** cho từng phần.

---

## 1. Trụ Cột A – Role & Tech Stack (Định danh)

### Mục tiêu

Giúp AI biết:

- Nó đang trong vai trò gì.
- Nó dùng những công cụ / framework nào.
- Nó đang làm việc trong loại sản phẩm / domain nào.

### Tiêu chí đánh giá

Development Guide đáp ứng tốt **Pillar A** nếu:

- [ ] Có định nghĩa **Role** rõ ràng, ví dụ:
  - `You are a Senior Backend Engineer.`
  - `You are a Fullstack Engineer specialized in Node.js and React.`
- [ ] Nêu cụ thể **tech stack**:
  - Backend: `Node.js 20`, `Express`, `TypeScript (strict mode)`, `Knex`, `PostgreSQL`, …
  - Frontend: `React 18/19`, `React Router`, `TanStack Query`, …
- [ ] Có nói rõ **phong cách coding ưu tiên**:
  - Ví dụ: “Use functional React components with hooks, no class components.”
  - “Prefer composition over inheritance.”
- [ ] Có mô tả ngắn về **domain**:
  - Ví dụ: “Online Auction platform với các entity: users, products, bids, watchlists, ratings, …”

> Nếu sau khi đọc mục này có thể trả lời được:  
> **AI là ai? Đang xây hệ thống gì? Dùng stack nào?**  
> → thì Pillar A được coi là đạt.

---

## 2. Trụ Cột B – The Map (Sơ đồ thư mục & Quy tắc đặt tên)

### Mục tiêu

Cung cấp cho AI một **bản đồ dự án** để:

- Không bịa đường dẫn file.
- Không tạo file sai vị trí.
- Không lẫn lộn trách nhiệm giữa các thư mục.

### Tiêu chí đánh giá

Development Guide đáp ứng tốt **Pillar B** nếu:

- [ ] Có **sơ đồ thư mục rút gọn**, ví dụ:

  ```text
  src/
    api/
      controllers/
      middlewares/
      schemas/
    services/
    repositories/
    db/
      migrations/
      seeds/
  ```
````

- [ ] Giải thích **vai trò từng thư mục / layer**:

  - `controllers` → nhận HTTP request, đọc params/query/body, gọi service, trả response.
  - `services` → xử lý business logic.
  - `repositories` → thao tác với DB thông qua Knex.
  - `db/migrations` → định nghĩa schema database.

- [ ] Có **quy tắc đặt tên file**:

  - Controllers: `[feature].controller.ts`
  - Services: `[feature].service.ts`
  - Repositories: `[entity].repo.ts`
  - Schemas: `[feature].schema.ts`

- [ ] Nếu dự án đã tồn tại:

  - Có nhắc tới một vài file thực tế, ví dụ: `user.controller.ts`, `bid.service.ts`, … để AI “bám” vào cấu trúc đó.

> Nếu AI có thể **đặt file đúng nơi, đặt tên đúng convention ngay từ đầu**, Pillar B được đánh giá là hoạt động tốt.

---

## 3. Trụ Cột C – The Workflow (Luồng xử lý dữ liệu)

### Mục tiêu

Giữ vững kiến trúc phân tầng, ví dụ:

> Controller → Service → Repository → Database

Tránh tình trạng:

- Gọi DB trực tiếp trong Controller.
- Nhét logic nghiệp vụ lung tung.

### Tiêu chí đánh giá

Development Guide đáp ứng tốt **Pillar C** nếu có:

- [ ] Mô tả rõ **luồng xử lý tiêu chuẩn cho một HTTP request**, ví dụ:

  ```text
  Step 1: Controller nhận request, đọc params/query/body.
  Step 2: Validate input bằng Zod Schema (request DTO).
  Step 3: Controller gọi Service với dữ liệu đã validate.
  Step 4: Service xử lý business logic, gọi Repository nếu cần.
  Step 5: Repository thao tác DB bằng Knex.
  Step 6: Service trả về domain object/result.
  Step 7: Controller chuyển result thành HTTP response (status code + JSON).
  ```

- [ ] Chỉ rõ **Validation nằm ở đâu**:

  - Ví dụ: “All request/response DTOs are defined in `src/api/schemas` using Zod.”

- [ ] Quy định **source of truth**:

  - Ví dụ: “Database schema (Knex migrations) is the source of truth for entities. Zod schemas must stay in sync with DB.”

- [ ] Nêu sơ bộ **cách xử lý lỗi**:

  - Ví dụ: “Controllers phải `try/catch`, log lỗi nếu cần, và trả về error JSON đã chuẩn hoá.”

> Nếu sau khi áp dụng Guide, AI không còn có xu hướng “đi tắt” (bỏ layer, gọi DB trong controller, …) thì Pillar C được coi là đạt.

---

## 4. Trụ Cột D – The Constraints (Luật cấm & Quy ước)

### Mục tiêu

Thiết lập **hàng rào an toàn**:

- Ngăn code “bẩn”.
- Ngăn thói quen viết tắt, bê tạm, hoặc phá kiến trúc.

### Cách cấu trúc

Phần Constraints nên tách thành 2 nhóm:

1. **Hard Constraints** – luật tuyệt đối không được vi phạm.
2. **Style & Convention Rules** – quy tắc phong cách, coding style ưu tiên.

### Tiêu chí đánh giá

Development Guide đáp ứng tốt **Pillar D** nếu:

#### 4.1. Hard Constraints

- [ ] Có liệt kê rõ các “cấm kỵ”, ví dụ:

  - “No `any` type in new TypeScript code.”
  - “Do not call database directly from controllers.”
  - “Do not put business logic inside controllers.”
  - “Do not change existing public API signatures unless explicitly requested.”
  - “Do not log secrets (passwords, tokens, API keys).”

#### 4.2. Style & Convention Rules

- [ ] Có quy định rõ **naming & mapping**:

  - Ví dụ: “DB dùng `snake_case`, code (TS/JS) dùng `camelCase`.”

- [ ] Có hướng dẫn về **error handling**:

  - Ví dụ: “Always use `try/catch` in controllers and return standardized error responses.”

- [ ] Có ưu tiên về cú pháp:

  - Ví dụ: “Use `async/await` instead of `.then().catch()` in newly written code.”

- [ ] Có nguyên tắc nếu style Guide mâu thuẫn với code hiện có:

  - Ví dụ: “If this guide conflicts with existing project code style, prefer following the existing project style.”

> Nếu phần này giúp AI **biết rõ những điều không được làm** và code tạo ra đều tuân theo quy ước chung, Pillar D được đánh giá là tốt.

---

## 5. Trụ Cột E – Few-Shot Examples (Ví dụ code mẫu)

### Mục tiêu

Cung cấp cho AI một số ví dụ **ngắn nhưng chuẩn** để nó “bắt chước”:

- Cấu trúc file.
- Cách viết controller/service.
- Cách dùng Zod, types, …

### Tiêu chí đánh giá

Development Guide đáp ứng tốt **Pillar E** nếu:

- [ ] Có **ít nhất một ví dụ controller** hoàn chỉnh nhưng ngắn gọn:

  - Nhận request → validate bằng Zod → gọi service → trả response.

- [ ] Có **ít nhất một ví dụ service**:

  - Nhận input đã type-safe → xử lý logic → gọi repository.

- [ ] (Tuỳ chọn) Có **ví dụ Zod schema + type inference**, chẳng hạn:

  ```ts
  export const CreateBidSchema = z.object({
    productId: z.string().uuid(),
    amount: z.number().positive(),
  });

  export type CreateBidInput = z.infer<typeof CreateBidSchema>;
  ```

- [ ] Các ví dụ:

  - Đủ rõ để dùng làm template.
  - Không quá dài, tránh bị lẫn business logic cụ thể.
  - Có ghi chú "Use this as a template for new controllers/services."

- [ ] **Counter-Examples (Ví dụ sai)** – AI học tốt hơn khi thấy cả "đúng" và "sai":

  - Ít nhất một ví dụ về **anti-pattern phổ biến** (ví dụ: business logic trong controller, gọi DB trực tiếp).
  - Giải thích **tại sao nó sai** và **hậu quả**.
  - Có link tới ví dụ đúng tương ứng.

  **Ví dụ format**:

  ````markdown
  ### ❌ Counter-Example: Business Logic in Controller (DON'T DO THIS)

  ```ts
  // BAD: Controller chứa business logic và gọi DB trực tiếp
  export const createBid = async (req: Request, res: Response) => {
    const { productId, amount } = req.body;

    // ❌ Gọi DB trực tiếp trong controller
    const product = await knex("products").where({ id: productId }).first();

    // ❌ Business logic nằm trong controller
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (amount <= product.current_price) {
      return res
        .status(400)
        .json({ error: "Bid amount must be higher than current price" });
    }

    // ❌ Tiếp tục logic phức tạp...
    const bid = await knex("bids")
      .insert({ product_id: productId, amount })
      .returning("*");

    return res.status(201).json(bid);
  };
  ```
  ````

  **Why it's bad:**

  - Controller trực tiếp gọi database → vi phạm separation of concerns
  - Business logic (validation giá, check product tồn tại) nằm trong controller → khó test, khó tái sử dụng
  - Không có service layer → không thể compose logic phức tạp
  - Khó maintain khi logic phát triển thêm (ví dụ: thêm auto-bid, notification, ...)

  **✅ Đúng:** Xem ví dụ controller chuẩn ở trên (Section 5.1)

  ```

  ```

> Nếu AI sinh thêm file mới mà **cấu trúc giống 80–90% ví dụ mẫu** và **tránh được các anti-pattern trong counter-examples**, có thể xem Pillar E đang phát huy tốt tác dụng.

---

## 6. Integration Scenarios (Kịch bản áp dụng Guide)

### Mục tiêu

Giữ cho Master Guide mang tính **tĩnh** (không phải lúc nào cũng phải sửa), nhưng vẫn cho phép:

- Linh hoạt trong cách AI tiếp cận một task mới.
- Chỉ cần nói: “Làm tính năng theo Scenario X” là AI hiểu quy trình tương ứng.

---

### 6.1. Scenario A – Greenfield (Tính năng mới hoàn toàn)

**Khi dùng**: Xây một tính năng từ con số 0 (chưa có UI, chưa có endpoint).

**Nguyên tắc chính**:

> Bắt đầu từ Types → Backend → Frontend.

**Tiêu chí**:

- [ ] Guide mô tả **thứ tự thực hiện**:

  1. Định nghĩa entity / DTO bằng TypeScript + Zod.
  2. Thiết kế API contract (route, method, payload, response).
  3. Implement repository + service.
  4. Implement controller.
  5. Cuối cùng mới xây UI & kết nối tới API.

- [ ] Có nhấn mạnh:

  - “Always start by defining types and schemas before implementing the logic.”

---

### 6.2. Scenario B – Mock Data / UI-first

**Khi dùng**: UI đã tồn tại (mock data / màn hình tĩnh), backend thật chưa có hoặc chưa hoàn chỉnh.

**Nguyên tắc chính**:

> Extract Mock → Adapter Pattern → Wiring.

**Tiêu chí**:

- [ ] Guide mô tả rõ các bước:

  1. Xác định state shape mà UI đang dùng + mock data hiện có.
  2. Khai báo TypeScript interfaces dựa trên mock.
  3. Thiết kế API contract (request/response) dựa trên nhu cầu hiện tại của UI.
  4. Implement backend đầy đủ (repo, service, controller).
  5. Thay mock bằng API thực (wiring UI → API).

- [ ] Có nhắc AI:

  - Không tự ý làm vỡ UI hiện tại bằng cách thay đổi cấu trúc dữ liệu một cách vô tội vạ, trừ khi được yêu cầu.

---

### 6.3. Scenario C – Refactor

**Khi dùng**: Code đã chạy, nhưng muốn làm sạch, tách layer, tối ưu.

**Nguyên tắc chính**:

> Giữ nguyên Input/Output bên ngoài, chỉ chỉnh sửa phần triển khai bên trong.

**Tiêu chí**:

- [ ] Guide ghi rõ:

  - “Do NOT change function signatures, request/response schemas, or routes unless explicitly asked.”

- [ ] Mục tiêu refactor:

  - Tách logic sang service/helper.
  - Giảm duplication.
  - Tăng readability và testability.

- [ ] Có gợi ý:

  - Viết patch nhỏ, tập trung, không đổi behavior bên ngoài.

---

### 6.4. (Tuỳ chọn) Scenario D – Bugfix / Debug

**Khi dùng**: Issue cụ thể, cần tìm nguyên nhân và sửa.

**Tiêu chí**:

- [ ] Guide phác thảo quy trình:

  1. Xác định cách tái hiện bug (input, context, điều kiện).
  2. Thêm log hoặc test nhỏ để khoanh vùng.
  3. Sửa với mức thay đổi nhỏ nhất có thể.
  4. Đảm bảo không làm hỏng behavior đang chạy ổn.

---

### 6.5. (Tuỳ chọn) Scenario E – Add Tests

**Khi dùng**: Yêu cầu thêm test (unit / integration).

**Tiêu chí**:

- [ ] Guide nêu rõ:

  - Dùng Jest, Vitest, hay framework nào.
  - Cấu trúc thư mục test: `src/__tests__`, `*.spec.ts`, v.v.

- [ ] Các nguyên tắc:

  - Ưu tiên test dựa trên **hành vi quan sát được** thay vì chi tiết triển khai bên trong.
  - Tập trung test cho services, pure functions, và các đoạn logic quan trọng.

---

## 7. Các Tiêu Chí Bổ Sung (Không bắt buộc nhưng nên có)

### 7.1. Project Context & Domain Glossary

- [ ] Mô tả vắn tắt về sản phẩm / hệ thống:

  - Ví dụ: “Đây là một hệ thống đấu giá online…”

- [ ] Có một **mini glossary** giải thích các thuật ngữ domain:

  - Ví dụ: `bid`, `auto-bid`, `listing`, `watchlist`, `seller rating`, …

### 7.2. Data Contracts & Validation

- [ ] Nêu rõ:

  - DB sử dụng (PostgreSQL), quản lý schema bằng Knex migrations.
  - Tất cả input từ bên ngoài phải được validate bằng Zod.

- [ ] Nhắc đến nguyên tắc:

  - “Zod schemas should reflect database structure and business rules.”

### 7.3. Testing & Error Handling Conventions

- [ ] Chuẩn hoá format error response, ví dụ:

  ```json
  {
    "message": "Error message",
    "code": "ERROR_CODE",
    "details": {}
  }
  ```

- [ ] Chỉ định cách logging:

  - Dùng logger riêng cho service/repo, hạn chế `console.log` trong production code.

### 7.4. Output Format Preference (Dành riêng cho AI)

- [ ] Ghi rõ kỳ vọng:

  - Khi chỉnh file → trả full file hay chỉ diff?
  - Ngôn ngữ giải thích: ví dụ “Giải thích bằng tiếng Việt, comment trong code bằng tiếng Anh.”
  - Quy ước dùng code block: `ts, `js, ```sql, …

---

## 8. ✅ Checklist Tổng – Development Guide Đã “Đủ Đô” Chưa?

Dùng checklist này để rà lại một file `MASTER_INSTRUCTIONS.md`:

### 8.1. Pillar A – Role & Stack

- [ ] Có định nghĩa rõ ràng role (Senior/Backend/Fullstack/…).
- [ ] Liệt kê cụ thể stack + version (Node/React/TypeScript/DB…).
- [ ] Có mô tả ngắn về domain / loại hệ thống.

### 8.2. Pillar B – The Map

- [ ] Có sơ đồ thư mục rút gọn.
- [ ] Giải thích vai trò từng layer (controller/service/repo/db).
- [ ] Nêu rõ naming convention cho file.

### 8.3. Pillar C – The Workflow

- [ ] Mô tả luồng chuẩn: Controller → Service → Repository → DB.
- [ ] Nêu rõ chỗ đặt validation (Zod/DTO).
- [ ] Nói sơ về error flow (ai catch, trả error thế nào).

### 8.4. Pillar D – Constraints

- [ ] Có danh sách Hard Constraints (luật cấm).
- [ ] Có Style & Convention Rules (naming, async/await, error, logging, …).
- [ ] Có quy định: conflict với code hiện có → ưu tiên follow code hiện có.

### 8.5. Pillar E – Few-Shot Examples

- [ ] Có ví dụ controller theo “chuẩn” của dự án.
- [ ] Có ví dụ service.
- [ ] (Tuỳ chọn) Có ví dụ Zod schema + type inference.

### 8.6. Integration Scenarios

- [ ] Có Scenario A – Greenfield (Types → Backend → Frontend).
- [ ] Có Scenario B – Mock Data / UI-first (Extract Mock → Adapter → Wiring).
- [ ] Có Scenario C – Refactor (giữ nguyên I/O).
- [ ] (Tuỳ chọn) Scenario D – Bugfix / Debug.
- [ ] (Tuỳ chọn) Scenario E – Add Tests.

### 8.7. Extra (Tuỳ chọn nhưng hữu ích)

- [ ] Có domain glossary.
- [ ] Có mô tả về data contracts & validation.
- [ ] Có conventions về testing & error handling.
- [ ] Có hướng dẫn về cách AI nên format output.

---

Khi một Development Guide vượt qua phần lớn các mục trong checklist này, có thể xem nó như một **System Prompt chuẩn sản xuất**:

- Đủ thông tin về context.
- Đủ quy tắc để bảo vệ kiến trúc.
- Đủ ví dụ để dẫn hướng phong cách code.
- Đủ kịch bản (scenario) để áp dụng linh hoạt cho các loại task khác nhau: xây mới, refactor, bugfix, UI-first, viết test, v.v.
