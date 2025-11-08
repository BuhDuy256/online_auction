import prisma from "../database/prisma.js";

/**
 * Lấy lịch sử tin nhắn của một hội thoại (có phân trang)
 * @param {BigInt} conversationId - ID hội thoại
 *â param {object} pagination - { skip, take }
 */
export const getMessages = async (
  conversationId,
  pagination = { skip: 0, take: 50 }
) => {
  const messages = await prisma.message.findMany({
    where: { conversationId },
    include: {
      sender: {
        select: { id: true, username: true, fullName: true },
      },
    },
    orderBy: { createdAt: "desc" }, // Lấy mới nhất trước
    skip: pagination.skip,
    take: pagination.take,
  });
  return messages.reverse(); // Đảo ngược lại để hiển thị đúng thứ tự
};

/**
 * Gửi một tin nhắn mới VÀ PHÁT SÓNG REAL-TIME
 * @param {object} messageData - { conversationId, senderId, body }
 * @param {object} io - Instance của Socket.io
 */
export const createMessage = async (messageData, io) => {
  const { conversationId, senderId, body } = messageData;

  // 1. Tạo tin nhắn trong CSDL
  const newMessage = await prisma.message.create({
    data: {
      conversationId,
      senderId,
      body,
    },
    include: {
      // Lấy thông tin sender để gửi cho client
      sender: {
        select: { id: true, username: true, fullName: true },
      },
    },
  });

  // 2. Phát tin nhắn này đến tất cả client trong "room"
  const roomId = conversationId.toString();
  io.to(roomId).emit("newMessage", newMessage);

  return newMessage;
};
