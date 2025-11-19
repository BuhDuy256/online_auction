import * as productRepository from '../repositories/product.repository';
import { SortOption } from '../api/schemas/product.schema';

export const searchProducts = async (
    q: string | undefined,
    category: string | undefined,
    page: number,
    limit: number,
    sort?: SortOption,
    exclude?: number
) => {
    if (category) {
        return await productRepository.findByCategory(category, page, limit, sort, exclude);
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

export const getProductCommentsById = async (productId: number, page: number, limit: number) => {
    return await productRepository.findCommentsById(productId, page, limit);
};

export const appendProductDescription = async (productId: number, sellerId: number, content: string) => {
    await productRepository.appendProductDescription(productId, sellerId, content);
};