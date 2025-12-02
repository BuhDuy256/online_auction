import { Request, Response, NextFunction } from "express";
import * as productService from "../../services/product.service";
import { logger } from "../../utils/logger.util";
import {
  formatResponse,
  formatPaginatedResponse,
} from "../../utils/response.util";
import {
  ProductsSearchQuery,
  CreateProduct,
  GetProductCommentsQuery,
  AppendProductDescription,
} from "../schemas/product.schema";

export const searchProducts = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const query = request.query as unknown as ProductsSearchQuery;
    const result = await productService.searchProducts(query);

    formatPaginatedResponse(response, 200, result.data, result.pagination);
  } catch (error) {
    logger.error("ProductController", "Failed to search products", error);
    next(error);
  }
};

export const createProduct = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const body = request.body as CreateProduct;
    const result = await productService.createProduct(body);

    formatResponse(response, 201, result);
  } catch (error) {
    logger.error("ProductController", "Failed to create product", error);
    next(error);
  }
};

export const getProductDetailById = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const result = await productService.getProductDetailById(
      Number(request.params.id)
    );

    formatResponse(response, 200, result);
  } catch (error) {
    logger.error("ProductController", "Failed to get product detail", error);
    next(error);
  }
};

export const getProductCommentsById = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const productId = Number(request.params.id);
    const query = request.query as unknown as GetProductCommentsQuery;
    const result = await productService.getProductCommentsById(
      productId,
      query
    );

    formatPaginatedResponse(response, 200, result.data, result.pagination);
  } catch (error) {
    logger.error("ProductController", "Failed to get product comments", error);
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
    const body = request.body as AppendProductDescription;
    await productService.appendProductDescription(productId, body);

    formatResponse(response, 200, {
      message: "Product description appended successfully",
    });
  } catch (error) {
    logger.error(
      "ProductController",
      "Failed to append product description",
      error
    );
    next(error);
  }
};

// Product Detail Page - New Implementation
export const getProductDetail = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const productId = Number(request.params.id);
    const userId = request.query.userId ? Number(request.query.userId) : undefined;

    const result = await productService.getProductDetail(productId, userId);
    formatResponse(response, 200, result);
  } catch (error) {
    logger.error("ProductController", "Failed to get product detail", error);
    next(error);
  }
};

export const getProductBidHistory = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const productId = Number(request.params.id);
    const page = Number(request.query.page) || 1;
    const limit = Number(request.query.limit) || 20;

    const result = await productService.getProductBidHistory(productId, page, limit);
    formatPaginatedResponse(response, 200, result.bids, result.pagination);
  } catch (error) {
    logger.error("ProductController", "Failed to get bid history", error);
    next(error);
  }
};

export const getProductQuestions = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const productId = Number(request.params.id);
    const page = Number(request.query.page) || 1;
    const limit = Number(request.query.limit) || 10;

    const result = await productService.getProductQuestions(productId, page, limit);
    formatPaginatedResponse(response, 200, result.questions, result.pagination);
  } catch (error) {
    logger.error("ProductController", "Failed to get product questions", error);
    next(error);
  }
};
