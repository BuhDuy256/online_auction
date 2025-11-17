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

export const getCurrentProductBidById = async (
    request: Request,
    response: Response,
    next: NextFunction
) => {
    try {
        const result = await productService.getCurrentProductBidById(Number(request.params.id));
        response .status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('[getCurrentProductBidById] Error:', error);
        next(error);
    }
};

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
        response .status(200).json({
            success: true,
            data: result.data,
            pagination: result.pagination,
        });
    } catch (error) {
        console.error('[getProductCommentsById] Error:', error);
        next(error);
    }
};