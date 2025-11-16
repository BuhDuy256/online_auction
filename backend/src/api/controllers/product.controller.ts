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
        const userId = 3; // Temporary hardcoded user ID
        const result = await productService.createProduct(userId, request.body);
        
        response.status(201).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('[createProduct] Error:', error);
        next(error);
    }
};