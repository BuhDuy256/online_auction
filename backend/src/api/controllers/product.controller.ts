import { Request, Response, NextFunction } from 'express';
import * as productService from '../../services/product.service';

export const searchProducts = async (
    request: Request,
    response: Response, 
    next: NextFunction
) => {
    try {
        const result = await productService.searchProducts(request.query);
        
        response.status(200).json({
            success: true,
            data: result.data,
            pagination: result.pagination,
        });
    } catch (error) {
        console.error('[searchProducts] Error:', error);
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
        
        response.status(201).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('[createProduct] Error:', error);
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
        
        response .status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('[getProductById] Error:', error);
        next(error);
    }
}

export const getProductCommentsById = async (
    request: Request,
    response: Response,
    next: NextFunction
) => {
    try {
        const result = await productService.getProductCommentsById(
            Number(request.params.id),
            request.query
        );
        response.status(200).json({
            success: true,
            data: result.data,
            pagination: result.pagination,
        });
    } catch (error) {
        console.error('[getProductCommentsById] Error:', error);
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

        const { seller_id, content } = request.body;
        await productService.appendProductDescription(productId, seller_id, content);

        response.status(200).json({
            success: true,
            message: 'Product description appended successfully'
        });
    } catch (error) {
        console.error('[appendProductDescription] Error:', error);
        next(error);
    }
};