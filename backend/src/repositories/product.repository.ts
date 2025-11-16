// product.repository.ts
import prisma from "../database/prisma"
import { toSlug } from "../utils/slug.util";
import { getCategoryIds } from "./category.repository";
import { SortOption } from "../api/schemas/product.schema";

export interface PaginatedResult<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

function escapeQuery(q: string) {
    return q
        .replace(/[-:!&|]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

export const fullTextSearch = async (q: string | undefined, page: number, limit: number, sort?: SortOption) => {
    const safeQ = escapeQuery(q || "");
    const offset = (page - 1) * limit;

    let orderByClause = 'ORDER BY ';
    if (sort && Array.isArray(sort) && sort.length > 0) {
        const orderParts = sort.map((item) => {
            const dbField = item.field === 'endTime' ? 'end_time' : item.field === 'price' ? 'current_price' : 'created_at';
            return `${dbField} ${item.direction.toUpperCase()}`;
        });
        orderByClause += orderParts.join(', ');
    } else {
        orderByClause += 'relevance DESC';
    }

    const queryStr = `
        SELECT 
            product_id,
            thumbnail_url,
            name,
            current_price,
            highest_bidder_id,
            status,
            start_time,
            end_time,
            bid_count,
            ts_rank(fts, websearch_to_tsquery('english', $1)) AS relevance
        FROM products
        WHERE 
            fts @@ websearch_to_tsquery('english', $1)
            AND status = 'active'
            AND end_time > NOW()
        ${orderByClause}
        LIMIT $2
        OFFSET $3
    `;

    const [products, totalCount] = await Promise.all([
        prisma.$queryRawUnsafe(queryStr, safeQ, limit, offset),
        prisma.$queryRaw<{ count: bigint }[]>`
            SELECT COUNT(*) as count
            FROM products
            WHERE 
                fts @@ websearch_to_tsquery('english', ${safeQ})
                AND status = 'active'
                AND end_time > NOW()
        `
    ]);

    const total = Number(totalCount[0].count);

    return {
        data: products,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        }
    };
};

export const findByCategory = async (categorySlug: string, page: number, limit: number, sort?: SortOption): Promise<PaginatedResult<any>> => {
    const slug = toSlug(categorySlug);
    const offset = (page - 1) * limit;

    const categoryIds = await getCategoryIds(slug);

    let orderBy: any = { created_at: 'desc' };
    if (sort && Array.isArray(sort) && sort.length > 0) {
        orderBy = sort.map((item) => {
            const dbField = item.field === 'endTime' ? 'end_time' : item.field === 'price' ? 'current_price' : 'created_at';
            return { [dbField]: item.direction };
        });
    }

    const [products, total] = await Promise.all([
        prisma.products.findMany({
            where: {
                category_id: { in: categoryIds },
                status: 'active',
                end_time: { gt: new Date() }
            },
            select: {
                product_id: true,
                thumbnail_url: true,
                name: true,
                current_price: true,
                highest_bidder_id: true,
                status: true,
                start_time: true,
                end_time: true,
                bid_count: true,
                categories: {
                    select: {
                        category_id: true,
                        name: true,
                        slug: true
                    }
                },
            },
            orderBy: orderBy,
            take: limit,
            skip: offset
        }),

        prisma.products.count({
            where: {
                category_id: { in: categoryIds },
                status: 'active',
                end_time: { gt: new Date() }
            }
        })
    ]);

    return {
        data: products,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        }
    };
};

export const createProduct = async (data: {
    name: string;
    category_id: number;
    seller_id: number;
    start_price: number;
    step_price: number;
    buy_now_price?: number;
    end_time: Date;
    auto_extend: boolean;
    description: string;
    thumbnail: string;
    images: string[];
}) => {
    return await prisma.$transaction(async (tx) => {
        const product = await tx.products.create({
            data: {
                name: data.name,
                category_id: data.category_id,
                seller_id: data.seller_id,
                start_price: data.start_price,
                current_price: data.start_price,
                step_price: data.step_price,
                buy_now_price: data.buy_now_price,
                end_time: data.end_time,
                auto_extend: data.auto_extend,
                thumbnail_url: data.thumbnail,
                status: 'active'
            }
        });

        await tx.product_descriptions.create({
            data: {
                product_id: product.product_id,
                author_id: data.seller_id,
                content: data.description,
                lang: 'vi',
                version: 1
            }
        });

        await tx.product_images.createMany({
            data: data.images.map(image_url => ({
                product_id: product.product_id,
                image_url
            }))
        });

        return product;
    });
};