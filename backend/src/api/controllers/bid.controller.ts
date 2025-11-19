import { Request, Response, NextFunction } from 'express';
import * as bidService from '../../services/bid.service';
import { placeBidSchema, getBidHistorySchema } from '../schemas/bid.schema';
import { logger } from '../../utils/logger.util';
import { formatResponse, formatPaginatedResponse } from '../../utils/response.util';

export const getHighestBidById = async (
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
        const result = await bidService.getHighestBidById(productId);
        formatResponse(response, 200, result);
    } catch (error) {
        logger.error('BidController', 'Failed to get highest bid', error);
        next(error);
    }
};

export const placeBid = async (
    request: Request,
    response: Response,
    next: NextFunction
) => {
    try {
        const { product_id, bidder_id, max_amount } = placeBidSchema.parse(request.body);
        await bidService.placeBid(product_id, bidder_id, max_amount);
        
        formatResponse(response, 200, { message: 'Bid placed successfully' });
    }
    catch (error) {
        logger.error('BidController', 'Failed to place bid', error);
        next(error);
    }
};

export const getBidHistoryById = async (
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

        const { page, limit } = getBidHistorySchema.parse(request.query);
        const result = await bidService.getBidHistory(productId, page, limit);

        formatPaginatedResponse(response, 200, result.data, result.pagination);
    } catch (error) {
        logger.error('BidController', 'Failed to get bid history', error);
        next(error);
    }
};