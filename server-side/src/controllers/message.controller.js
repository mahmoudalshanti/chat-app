import prisma from "../db/prisma.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user.id;

    let conversation = await prisma.conversation.findFirst({
      where: {
        participantIds: {
          hasEvery: [senderId, receiverId], // match if all participantIds has all this senderId and receiverId
        },
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participantIds: {
            set: [senderId, receiverId], //  make new array with two users
          },
        },
      });
    }

    const newMessage = await prisma.message.create({
      data: {
        senderId,
        body: message,
        conversationId: conversation.id,
      },
    });

    if (newMessage) {
      conversation = await prisma.conversation.update({
        where: {
          id: conversation.id,
        },

        data: {
          messages: {
            connect: {
              id: newMessage.id, // that will point to the converstion
            },
          },
        },
      });
    }

    // get id for of receiver and show if exist in array of online users
    const receiverSocketId = getReceiverSocketId(receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    return res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessage: ", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  const { id: userToChatId } = req.params;
  const senderId = req.user.id;

  try {
    const conversation = await prisma.conversation.findFirst({
      where: {
        participantIds: {
          hasEvery: [senderId, userToChatId],
        },
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!conversation) {
      return res.status(200).json([]);
    }
    return res.status(200).json(conversation.messages);
  } catch (error) {
    console.error("Error in sendMessage: ", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getUsersForSidebar = async (req, res) => {
  try {
    const authUserId = req.user.id;

    const users = await prisma.user.findMany({
      where: {
        id: {
          not: authUserId,
        },
      },
      select: {
        id: true,
        fullName: true,
        profilePic: true,
      },
    });

    return res.status(200).json(users);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};
