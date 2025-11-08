import * as userService from "../controllers/user.controller.js";
import { requireAuth } from "../../middlewares/requireAuth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { Router } from "express";
import { searchUserSchema } from "../schemas/user.schema.js";

const router = Router();

router.get("/me", requireAuth, userService.getMe);
router.get(
  "/search",
  requireAuth,
  validate(searchUserSchema),
  userService.searchUsers
);

export default router;
