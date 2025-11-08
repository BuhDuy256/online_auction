import prisma from "../database/prisma.js";

export const createParticipant = async (participantData) => {
  const { userId, conversationId, joinedAt } = participantData;

  const participant = await prisma.Participant.create({
    data: {
      userId,
      conversationId,
      joinedAt: joinedAt || new Date(),
    },
  });

  return participant;
};
