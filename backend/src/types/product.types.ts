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

export interface ProductComment {
    comment_id: number;
    content: string;
    user: {
        user_id: number;
        full_name: string;
    };
    created_at: Date;
    updated_at: Date | null;
    replies: Array<{
        comment_id: number;
        content: string;
        user: {
            user_id: number;
            full_name: string;
        };
        created_at: Date;
        updated_at: Date | null;
    }>;
}

export interface ProductBidInfo {
    step_price: number;
    start_price: number;
    current_price: number;
    highest_bidder_id: number | null;
}
