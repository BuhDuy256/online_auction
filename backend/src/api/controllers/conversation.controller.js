import * as conversationService from "../../services/conversation.service.js";

/**
 * Controller: Lấy tất cả hội thoại của tôi
 */
export const getMyConversations = async (req, res, next) => {
  try {
    const selfUserId = req.user.id; // Từ middleware requireAuth
    const conversations = await conversationService.getConversations(
      selfUserId
    );
    res.status(200).json(conversations);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Tạo hội thoại mới
 */
export const createConversation = async (req, res, next) => {
  try {
    const selfUserId = BigInt(req.user.id);
    const { userIds, name } = req.body; // Đã validate

    // JSON gửi `number`, CSDL dùng `BigInt`
    // Chúng ta cần chuyển đổi kiểu dữ liệu
    const userIdsAsBigInt = userIds.map((id) => BigInt(id));

    const conversation = await conversationService.createConversation(
      selfUserId,
      userIdsAsBigInt,
      name || null // Gửi null nếu 'name' là undefined
    );

    res.status(201).json(conversation);
  } catch (error) {
    next(error);
  }
};
