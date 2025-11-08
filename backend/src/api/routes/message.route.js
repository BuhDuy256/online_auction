import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import * as messageController from "../controllers/message.controller.js";
// (Bạn nên tạo 1 schema cho message)

// 'mergeParams: true' là BẮT BUỘC
// để router này có thể đọc :conversationId từ router cha
const router = Router({ mergeParams: true });

// GET /api/conversations/:conversationId/messages
router.get("/", messageController.getMessages);

// POST /api/conversations/:conversationId/messages
router.post(
  "/",
  /* validate(messageSchema), */ messageController.createMessage
);

export default router;
