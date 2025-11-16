import { Request, Response, NextFunction } from "express";
import * as formService from "../../services/form.service";

export const getProductSchema = async (
    request: Request,
    response: Response,
    next: NextFunction
) => {
    try {
        const result = await formService.getProductSchema();

        response.status(200).json(result);
    } catch (error) {
        console.error('[getProductSchemeForm] Error:', error);
        next(error);
    }
}