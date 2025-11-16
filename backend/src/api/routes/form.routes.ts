import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware";
import * as formController from "../controllers/form.controller";

const router = Router();

router.get("/product-schema", formController.getProductSchema);

export default router;