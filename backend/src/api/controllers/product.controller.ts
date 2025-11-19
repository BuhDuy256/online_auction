import { Request, Response, NextFunction } from 'express';
import * as productService from '../../services/product.service';
import { searchProductSchema, getProductCommentsSchema, appendProductDescriptionSchema } from '../schemas/product.schema';
import { logger } from '../../utils/logger.util';
import { formatResponse, formatPaginatedResponse } from '../../utils/response.util';

export const searchProducts = async (
    request: Request,
    response: Response, 
    next: NextFunction
) => {
    try {
        const { q, category, page, limit, sort, exclude } = searchProductSchema.parse(request.query);
        const result = await productService.searchProducts(q, category, page, limit, sort, exclude);
        
        formatPaginatedResponse(response, 200, result.data, result.pagination);
    } catch (error) {
        logger.error('ProductController', 'Failed to search products', error);
        next(error);
    }
};

export const createProduct = async (
    request: Request,
    response: Response,
    next: NextFunction
) => {
    try {
        const result = await productService.createProduct(request.body);
        
        formatResponse(response, 201, result);
    } catch (error) {
        logger.error('ProductController', 'Failed to create product', error);
        next(error);
    }
};

export const getProductDetailById = async (
    request: Request,
    response: Response,
    next: NextFunction
) => {
    try {
        const result = await productService.getProductDetailById(Number(request.params.id));
        
        formatResponse(response, 200, result);
    } catch (error) {
        logger.error('ProductController', 'Failed to get product detail', error);
        next(error);
    }
}

export const getProductCommentsById = async (
    request: Request,
    response: Response,
    next: NextFunction
) => {
    try {
        const productId = Number(request.params.id);
        const { page, limit } = getProductCommentsSchema.parse(request.query);
        const result = await productService.getProductCommentsById(productId, page, limit);
        
        formatPaginatedResponse(response, 200, result.data, result.pagination);
    } catch (error) {
        logger.error('ProductController', 'Failed to get product comments', error);
        next(error);
    }
};

export const appendProductDescription = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const productId = Number(request.params.id);
        if (!productId || isNaN(productId)) {
            response.status(400).json({
                success: false,
                error: 'Invalid product ID'
            });
            return;
        }

        const { seller_id, content } = appendProductDescriptionSchema.parse(request.body);
        await productService.appendProductDescription(productId, seller_id, content);

        formatResponse(response, 200, { message: 'Product description appended successfully' });
    } catch (error) {
        logger.error('ProductController', 'Failed to append product description', error);
        next(error);
    }
};