import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware";
import { searchProductsSchema, createProductSchema, getProductCommentsSchema, appendProductDescriptionSchema } from "../schemas/product.schema";
import * as productController from "../controllers/product.controller";

const router = Router();

router.get("/",
  validate(searchProductsSchema, 'query'),
  productController.searchProducts
);

router.post("/",
  validate(createProductSchema, 'body'),
  productController.createProduct
);

router.get("/:id",
  productController.getProductDetailById
);

router.get("/:id/comments",
  validate(getProductCommentsSchema, 'query'),
  productController.getProductCommentsById
);

router.post("/:id/description",
  validate(appendProductDescriptionSchema, 'body'),
  productController.appendProductDescription
);

export default router;