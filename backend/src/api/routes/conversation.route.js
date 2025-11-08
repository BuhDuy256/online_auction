import { validate } from "../../middlewares/validate.middleware.js";
import { requireAuth } from "../../middlewares/requireAuth.middleware.js";
import { Router } from "express";
import * as conversationController from "../controllers/conversation.controller.js";
import { createConversationSchema } from "../schemas/conversation.schema.js";

const router = Router();

router.use(requireAuth);
router.get("/", conversationController.getMyConversations);
router.post(
  "/",
  validate(createConversationSchema),
  conversationController.createConversation
);

export default router;
