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

export interface ProductDetail {
    thumbnail: string;
    name: string;
    start_price: number;
    step_price: number;
    buy_now_price?: number;
    current_price: number;
    created_at: Date;
    end_time: Date;
    bid_count: number;
    auto_extend: boolean;
    status: string;
    images: string[];
    seller: {
        id: number;
        full_name: string;
        positive_reviews: number;
        negative_reviews: number;
    };
    description: string;
    category: {
        id: number;
        name: string;
        slug: string;
        parent?: {
            id: number;
            name: string;
            slug: string;
        };
    };
}

export interface HighestBidder {
    current_price: number;
    highest_bidder: {
        id: number;
        full_name: string;
        positive_reviews: number;
        negative_reviews: number;
    }
}

export interface ProductComment {
    comment_id: number;
    content: string;
    user: {
        user_id: number;
        full_name: string;
    };
    created_at: Date;
    updated_at: Date | null;
    replies: {
        comment_id: number;
        content: string;
        user: {
            user_id: number;
            full_name: string;
        };
        created_at: Date;
        updated_at: Date | null;
    }[];
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

    let orderBy: any = { created_at: 'desc' };
    if (sort && Array.isArray(sort) && sort.length > 0) {
        orderBy = sort.map((item) => {
            const dbField = item.field === 'endTime' ? 'end_time' : item.field === 'price' ? 'current_price' : 'created_at';
            return { [dbField]: item.direction };
        });
    }

    const searchCondition = safeQ ? {
        fts: {
            search: safeQ
        }
    } : {};

    const [products, total] = await Promise.all([
        prisma.products.findMany({
            where: {
                ...searchCondition,
                status: 'active',
                end_time: { gt: new Date() }
            },
            select: {
                product_id: true,
                thumbnail_url: true,
                name: true,
                current_price: true,
                status: true,
                start_time: true,
                end_time: true,
                bid_count: true,
                users_products_highest_bidder_idTousers: {
                    select: {
                        id: true,
                        full_name: true
                    }
                }
            },
            orderBy: orderBy,
            skip: offset,
            take: limit
        }),
        prisma.products.count({
            where: {
                ...searchCondition,
                status: 'active',
                end_time: { gt: new Date() }
            }
        })
    ]);

    return {
        data: products.map(p => ({
            product_id: p.product_id,
            thumbnail_url: p.thumbnail_url,
            name: p.name,
            current_price: p.current_price,
            status: p.status,
            start_time: p.start_time,
            end_time: p.end_time,
            bid_count: p.bid_count,
            highest_bidder: p.users_products_highest_bidder_idTousers ? {
                id: p.users_products_highest_bidder_idTousers.id,
                full_name: p.users_products_highest_bidder_idTousers.full_name
            } : null
        })),
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
            const dbField = item.field === 'endTime' ? 'end_time' : 
                           item.field === 'price' ? 'current_price' : 
                           item.field === 'bidCount' ? 'bid_count' : 'created_at';
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
                status: true,
                start_time: true,
                end_time: true,
                bid_count: true,
                users_products_highest_bidder_idTousers: {
                    select: {
                        id: true,
                        full_name: true
                    }
                },
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
        data: products.map(p => ({
            product_id: p.product_id,
            thumbnail_url: p.thumbnail_url,
            name: p.name,
            current_price: p.current_price,
            status: p.status,
            start_time: p.start_time,
            end_time: p.end_time,
            bid_count: p.bid_count,
            highest_bidder: p.users_products_highest_bidder_idTousers ? {
                id: p.users_products_highest_bidder_idTousers.id,
                full_name: p.users_products_highest_bidder_idTousers.full_name
            } : null,
            categories: p.categories
        })),
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

const toNum = (value: any): number =>
    value && typeof value.toNumber === 'function' ? value.toNumber() : Number(value) || 0;

export const findDetailById = async (productId: number): Promise<ProductDetail | null> => {
    const product = await prisma.products.findUnique({
        where: { product_id: productId },
        select: {
            thumbnail_url: true,
            name: true,
            start_price: true,
            step_price: true,
            buy_now_price: true,
            current_price: true,
            created_at: true,
            end_time: true,
            bid_count: true,
            auto_extend: true,
            status: true,
            product_images: {
                select: {
                    image_url: true
                },
                orderBy: {
                    image_id: 'asc'
                }
            },
            users_products_seller_idTousers: {
                select: {
                    id: true,
                    full_name: true,
                    positive_reviews: true,
                    negative_reviews: true
                }
            },
            product_descriptions: {
                select: {
                    content: true
                },
                where: {
                    lang: 'vi'
                },
                orderBy: {
                    version: 'desc'
                },
                take: 1
            },
            categories: {
                select: {
                    category_id: true,
                    name: true,
                    slug: true,
                    parent_id: true,
                    categories: {
                        select: {
                            category_id: true,
                            name: true,
                            slug: true
                        }
                    }
                }
            }
        }
    });

    if (!product) {
        return null;
    }

    return {
        thumbnail: product.thumbnail_url || '',
        name: product.name,
        start_price: toNum(product.start_price),
        step_price: toNum(product.step_price),
        buy_now_price: product.buy_now_price ? toNum(product.buy_now_price) : undefined,
        current_price: toNum(product.current_price),
        created_at: product.created_at,
        end_time: product.end_time,
        bid_count: product.bid_count,
        auto_extend: product.auto_extend,
        status: product.status,
        images: product.product_images.map(img => img.image_url),
        seller: {
            id: product.users_products_seller_idTousers.id,
            full_name: product.users_products_seller_idTousers.full_name,
            positive_reviews: product.users_products_seller_idTousers.positive_reviews,
            negative_reviews: product.users_products_seller_idTousers.negative_reviews
        },
        description: product.product_descriptions[0]?.content || '',
        category: {
            id: product.categories.category_id,
            name: product.categories.name,
            slug: product.categories.slug,
            parent: product.categories.categories ? {
                id: product.categories.categories.category_id,
                name: product.categories.categories.name,
                slug: product.categories.categories.slug
            } : undefined
        }
    };
};

export const findHighestBidById = async (productId: number): Promise<HighestBidder> => {
    const currentBid = await prisma.products.findUnique({
        where: { product_id: productId },
        select: {
            current_price: true,
            users_products_highest_bidder_idTousers: {
                select: {
                    id: true,
                    full_name: true,
                    positive_reviews: true,
                    negative_reviews: true
                }
            }
        }
    });

    return {
        current_price: toNum(currentBid?.current_price),
        highest_bidder: {
            id: currentBid?.users_products_highest_bidder_idTousers?.id ?? 0,
            full_name: currentBid?.users_products_highest_bidder_idTousers?.full_name ?? '',
            positive_reviews: currentBid?.users_products_highest_bidder_idTousers?.positive_reviews ?? 0,
            negative_reviews: currentBid?.users_products_highest_bidder_idTousers?.negative_reviews ?? 0,
        }
    }
}

export const findCommentsById = async (productId: number, page: number, limit: number): Promise<PaginatedResult<ProductComment>> => {
    const offset = (page - 1) * limit;

    const [parentComments, total] = await Promise.all([
        prisma.product_comments.findMany({
            where: {
                product_id: productId,
                parent_id: null
            },
            select: {
                comment_id: true,
                content: true,
                created_at: true,
                updated_at: true,
                users: {
                    select: {
                        id: true,
                        full_name: true
                    }
                },
                other_product_comments: {
                    select: {
                        comment_id: true,
                        content: true,
                        created_at: true,
                        updated_at: true,
                        users: {
                            select: {
                                id: true,
                                full_name: true
                            }
                        }
                    },
                    orderBy: {
                        created_at: 'asc'
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            },
            skip: offset,
            take: limit
        }),
        prisma.product_comments.count({
            where: {
                product_id: productId,
                parent_id: null
            }
        })
    ]);

    const data = parentComments.map(comment => ({
        comment_id: comment.comment_id,
        content: comment.content,
        user: {
            user_id: comment.users.id,
            full_name: comment.users.full_name
        },
        created_at: comment.created_at,
        updated_at: comment.updated_at,
        replies: comment.other_product_comments.map(reply => ({
            comment_id: reply.comment_id,
            content: reply.content,
            user: {
                user_id: reply.users.id,
                full_name: reply.users.full_name
            },
            created_at: reply.created_at,
            updated_at: reply.updated_at
        }))
    }));

    return {
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
}