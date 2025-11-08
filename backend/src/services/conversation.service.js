import prisma from "../database/prisma.js";

/**
 * Lấy tất cả các cuộc hội thoại của một user
 * @param {BigInt} selfUserId - ID của user đang đăng nhập
 */
export const getConversations = async (selfUserId) => {
  const conversations = await prisma.Conversation.findMany({
    // Tìm tất cả các hội thoại...
    where: {
      participants: {
        // ...mà trong đó CÓ MỘT SỐ (some) participant...
        some: {
          userId: selfUserId, // ...có ID là của user đang đăng nhập
        },
      },
    },
    include: {
      // Lấy thông tin của tất cả thành viên
      participants: {
        include: {
          user: {
            select: { id: true, username: true, fullName: true },
          },
        },
      },
      // Lấy tin nhắn CUỐI CÙNG để hiển thị preview
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          sender: {
            select: { id: true, username: true, fullName: true },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc", // Sắp xếp hội thoại mới nhất lên đầu
    },
  });
  return conversations;
};

/**
 * Tạo một hội thoại mới (1-1 hoặc nhóm)
 * @param {BigInt} selfUserId - ID của người tạo
 * @param {BigInt[]} userIds - Mảng ID của những người khác
 * @param {string | null} name - Tên nhóm (nếu là nhóm)
 */
export const createConversation = async (selfUserId, userIds, name) => {
  // Gộp ID của người tạo và những người được mời
  const allUserIds = [selfUserId, ...userIds];

  // --- KIỂM TRA CHAT 1-1 BỊ TRÙNG ---
  // Nếu không có tên (name) và chỉ có 2 thành viên (bạn + 1 người)
  if (!name && allUserIds.length === 2) {
    const existingConversation = await prisma.Conversation.findFirst({
      where: {
        isGroup: false,
        // Tìm hội thoại có 2 điều kiện:
        AND: [
          // Điều kiện 2: Có user A
          { participants: { some: { userId: selfUserId } } },

          // Điều kiện 3: Có user B
          { participants: { some: { userId: userIds[0] } } },
        ],
      },
    });

    // Nếu đã tồn tại, trả về hội thoại đó luôn
    if (existingConversation) {
      return existingConversation;
    }
  }

  // --- TẠO HỘI THOẠI MỚI ---
  const newConversation = await prisma.Conversation.create({
    data: {
      name: name,
      isGroup: allUserIds.length > 2, // Tự động là nhóm nếu > 2 người
      creatorId: selfUserId,
      // Tạo các participant ngay lúc tạo conversation
      participants: {
        create: allUserIds.map((id) => ({
          userId: id,
          // joinedAt sẽ tự động được set bởi CSDL
        })),
      },
    },
    // Trả về dữ liệu tương tự như getConversations
    include: {
      participants: {
        include: {
          user: {
            select: { id: true, username: true, fullName: true },
          },
        },
      },
    },
  });

  return newConversation;
};
