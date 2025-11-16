import * as productRepository from '../repositories/product.repository';
import { searchProductSchema } from '../api/schemas/product.schema';

export const searchProducts = async (query: any) => {
    // Default values are handled in validate middleware
    const { q, category, page, limit, sort } = searchProductSchema.parse(query);

    // Handle empty q & category in validate middleware

    if (category) {
        const result = await productRepository.findByCategory(category, page, limit, sort);
        // Don't need to throw NotFoundError here, just return empty result and let frontend handle it
        // if (result.data.length === 0) {
        //     throw new NotFoundError(`No products found for category: ${categorySlug}`);
        // }
        return result;
    }

    return await productRepository.fullTextSearch(q, page, limit, sort);
};

export const createProduct = async (userId: number, data: {
    name: string;
    category_id: number;
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
        seller_id: userId,
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

