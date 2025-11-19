# Backend Development Guide

## Quy tắc khi thêm API mới

### 1. Kiến trúc 3 lớp (Controller → Service → Repository)

**Controller**: Xử lý request/response, validation
```typescript
export const yourController = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const data = yourSchema.parse(request.body);
        const result = await yourService.method(data);
        formatResponse(response, 200, result);
    } catch (error) {
        logger.error('ControllerName', 'Error message', error);
        next(error);
    }
};
```

**Service**: Business logic
```typescript
export const yourService = async (id: number): Promise<YourType> => {
    const data = await yourRepository.findById(id);
    if (!data) {
        throw new NotFoundError('Resource not found');
    }
    return data;
};
```

**Repository**: Truy vấn database
```typescript
export const findById = async (id: number): Promise<YourType | null> => {
    const result = await prisma.your_table.findUnique({
        where: { id }
    });
    return result ? {
        ...result,
        price: toNum(result.price)
    } : null;
};
```

### 2. Request Validation

Sử dụng Zod schema trong `src/api/schemas/`:
```typescript
export const yourSchema = z.object({
    field: z.string(),
    amount: z.number().positive()
});

const data = yourSchema.parse(request.body);
```

### 3. Response Format chuẩn

```typescript
formatResponse(response, 200, data);

formatPaginatedResponse(response, 200, data, pagination);
```

### 4. Error Handling

```typescript
try {
    // logic
} catch (error) {
    logger.error('ControllerName', 'Error message', error);
    next(error);
}
```

### 5. Type Safety

Định nghĩa interfaces trong `src/types/`:
```typescript
export interface YourType {
    id: number;
    name: string;
}
```

Thêm explicit return types cho tất cả functions:
```typescript
export const yourService = async (id: number): Promise<YourType> => {
    // ...
};
```

### 6. Constants

Extract magic numbers vào `src/utils/constant.util.ts`:
```typescript
export const YOUR_CONSTANTS = {
    MAX_VALUE: 100,
    MIN_VALUE: 0
} as const;
```

### 7. Database Transactions

Wrap multiple DB operations trong transaction:
```typescript
await prisma.$transaction(async (tx) => {
    await tx.table1.create({...});
    await tx.table2.update({...});
});
```

### 8. Repository Layer

- Chỉ export functions, không export types
- Sử dụng Prisma client
- Convert Decimal sang number với `toNum()`

```typescript
return {
    ...result,
    price: toNum(result.price)
};
```

### 9. Logging

Sử dụng `logger` thay vì `console.log/error`:
```typescript
logger.info('Component', 'message');
logger.error('Component', 'message', error);
```

### 10. Route Registration

```typescript
router.post('/', validate(yourSchema, 'body'), yourController);
router.get('/:id', validate(idParamSchema, 'params'), yourController);
```

### 11. Không sử dụng

- ❌ Comments trong code
- ❌ Icons/emojis trong code
- ❌ `console.log/error` (dùng logger)
- ❌ Inline response formatting (dùng formatResponse)
- ❌ Export interfaces từ repository

### 12. Error Classes

Sử dụng custom errors:

- `NotFoundError` - Resource not found (404)
- `ForbiddenError` - Access denied (403)
- `ValidationError` - Invalid input (400)
- `UnauthorizedError` - Auth required (401)

```typescript
import { NotFoundError, ForbiddenError } from '../errors';

throw new NotFoundError('Product not found');
throw new ForbiddenError('Access denied');
```

## Example: Complete Flow

```typescript
// 1. Define Type (src/types/product.types.ts)
export interface Product {
    product_id: number;
    name: string;
    price: number;
}

// 2. Create Schema (src/api/schemas/product.schema.ts)
export const createProductSchema = z.object({
    name: z.string().min(1),
    price: z.number().positive()
});

// 3. Repository (src/repositories/product.repository.ts)
export const create = async (data: CreateData): Promise<Product> => {
    return await prisma.products.create({ data });
};

// 4. Service (src/services/product.service.ts)
export const createProduct = async (data: CreateData): Promise<Product> => {
    return await productRepository.create(data);
};

// 5. Controller (src/api/controllers/product.controller.ts)
export const createProduct = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const data = createProductSchema.parse(request.body);
        const result = await productService.createProduct(data);
        formatResponse(response, 201, result);
    } catch (error) {
        logger.error('ProductController', 'Failed to create product', error);
        next(error);
    }
};

// 6. Route (src/api/routes/product.route.ts)
router.post('/', validate(createProductSchema, 'body'), productController.createProduct);
```
