import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware";
import { searchProductSchema, createProductSchema, getProductCommentsSchema } from "../schemas/product.schema";
import * as productController from "../controllers/product.controller";
import { requireAuth } from "../../middlewares/requireAuth.middleware";

const router = Router();

router.get("/", validate(searchProductSchema, 'query'), productController.searchProducts);
// router.post("/", requireAuth, validate(createProductSchema, 'body'), productController.createProduct);
router.post("/", validate(createProductSchema, 'body'), productController.createProduct);
router.get("/:productId", productController.getProductDetailById);
router.get("/:productId/current-bid", productController.getCurrentProductBidById);
router.get("/:productId/comments", validate(getProductCommentsSchema, 'query'), productController.getProductCommentsById);
export default router;