import * as productRepository from '../repositories/product.repository';
import { searchProductSchema, getProductCommentsSchema } from '../api/schemas/product.schema';

export const searchProducts = async (query: any) => {
    const { q, category, page, limit, sort, exclude } = searchProductSchema.parse(query);

    if (category) {
        const result = await productRepository.findByCategory(category, page, limit, sort, exclude);
        return result;
    }

    return await productRepository.fullTextSearch(q, page, limit, sort, exclude);
};

export const createProduct = async (data: {
    name: string;
    category_id: number;
    seller_id: number;
    start_price: number;
    step_price: number;
    buy_now_price?: number;
    description: string;
    end_time: Date;
    auto_extend: string;
    thumbnail: string;
    images: string[];
}) => {
    const product = await productRepository.createProduct({
        name: data.name,
        category_id: data.category_id,
        seller_id: data.seller_id,
        start_price: data.start_price,
        step_price: data.step_price,
        buy_now_price: data.buy_now_price,
        end_time: data.end_time,
        auto_extend: data.auto_extend === 'yes',
        description: data.description,
        thumbnail: data.thumbnail,
        images: data.images
    });

    return {
        product_id: product.product_id,
        name: product.name,
        status: product.status
    };
};

export const getProductDetailById = async (productId: number) => {
    const product = await productRepository.findDetailById(productId);
    return product;
};

export const getProductCommentsById = async (productId: number, query: any) => {
    const { page, limit } = getProductCommentsSchema.parse(query);
    const comments = await productRepository.findCommentsById(productId, page, limit);
    return comments;
};

export const appendProductDescription = async (productId: number, sellerId: number, content: string) => {
    await productRepository.appendProductDescription(productId, sellerId, content);
};