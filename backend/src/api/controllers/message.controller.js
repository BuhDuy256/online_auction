import * as messageService from "../../services/message.service.js";

/**
 * Controller: Lấy lịch sử tin nhắn
 */
export const getMessages = async (req, res, next) => {
  try {
    // (Chúng ta sẽ cần check xem user có trong hội thoại này không - Sẽ làm sau)
    const conversationId = BigInt(req.params.conversationId);

    // Logic phân trang (ví dụ: ?page=1&limit=50)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const messages = await messageService.getMessages(conversationId, {
      skip,
      take: limit,
    });
    res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Gửi tin nhắn
 */
export const createMessage = async (req, res, next) => {
  try {
    // (Cần check user có trong hội thoại không)
    const conversationId = BigInt(req.params.conversationId);
    const senderId = req.user.id; // Từ requireAuth
    const { body } = req.body;
    const io = req.io; // <-- Lấy 'io' từ request

    const messageData = { conversationId, senderId, body };
    const newMessage = await messageService.createMessage(messageData, io);

    res.status(201).json(newMessage);
  } catch (error) {
    next(error);
  }
};
