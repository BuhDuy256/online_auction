import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  details?: any;
}

export const formatResponse = <T>(response: Response, statusCode: number, data: T, message?: string): void => {
  response.status(statusCode).json({
    success: true,
    data,
    ...(message && { message })
  });
};

export const formatPaginatedResponse = <T>(
  response: Response,
  statusCode: number,
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }
): void => {
  response.status(statusCode).json({
    success: true,
    data,
    pagination
  });
};

export const formatError = (error: string, details?: any): ApiError => ({
  success: false,
  error,
  ...(details && { details })
});
