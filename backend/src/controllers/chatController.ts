import { Request, Response } from "express";
import { Chat, User } from "../models";
import { asyncHandler, ApiErrorClass } from "../middleware/errorMiddleware";

// @desc    Get user's chats
// @route   GET /api/chat
// @access  Private
export const getChats = asyncHandler(async (req: Request, res: Response) => {
  const chats = await Chat.find({
    participants: req.user._id,
  })
    .populate("participants", "fullName avatar isVerified")
    .populate("product", "title images price")
    .populate("shop", "shopName shopSlug")
    .populate({
      path: "messages",
      options: {
        sort: { timestamp: -1 },
        limit: 1,
      },
      select: "content type timestamp sender",
    })
    .sort({ updatedAt: -1 });

  // Calculate unread counts
  const chatsWithUnread = await Promise.all(
    chats.map(async (chat) => {
      const unreadCount = await Chat.aggregate([
        { $match: { _id: chat._id } },
        { $unwind: "$messages" },
        {
          $match: {
            "messages.readBy.user": { $ne: req.user._id },
            "messages.sender": { $ne: req.user._id },
          },
        },
        { $count: "unread" },
      ]);

      const chatObj = chat.toObject();
      chatObj.unreadCount = {
        [req.user._id]: unreadCount[0]?.unread || 0,
      };

      // Set last message info
      if (chat.messages.length > 0) {
        chatObj.lastMessage = chat.messages[0].content;
        chatObj.lastMessageAt = chat.messages[0].timestamp;
      }

      return chatObj;
    })
  );

  res.json({
    success: true,
    data: chatsWithUnread,
  });
});

// @desc    Start or get existing chat
// @route   POST /api/chat/start
// @access  Private
export const startChat = asyncHandler(async (req: Request, res: Response) => {
  const { otherUserId, productId, shopId } = req.body;

  if (!otherUserId) {
    throw new ApiErrorClass("Other user ID is required", 400);
  }

  // Check if chat already exists
  let chat = await Chat.findOne({
    participants: { $all: [req.user._id, otherUserId] },
    ...(productId && { product: productId }),
  })
    .populate("participants", "fullName avatar isVerified")
    .populate("product", "title images price")
    .populate("shop", "shopName shopSlug")
    .populate("messages");

  if (!chat) {
    // Create new chat
    chat = await Chat.create({
      participants: [req.user._id, otherUserId],
      product: productId,
      shop: shopId,
      messages: [],
    });

    chat = await Chat.findById(chat._id)
      .populate("participants", "fullName avatar isVerified")
      .populate("product", "title images price")
      .populate("shop", "shopName shopSlug")
      .populate("messages");
  }

  res.json({
    success: true,
    data: chat,
  });
});

// @desc    Get specific chat
// @route   GET /api/chat/:id
// @access  Private
export const getChat = asyncHandler(async (req: Request, res: Response) => {
  const chat = await Chat.findById(req.params.id)
    .populate("participants", "fullName avatar isVerified")
    .populate("product", "title images price")
    .populate("shop", "shopName shopSlug")
    .populate({
      path: "messages",
      options: { sort: { timestamp: 1 } },
    });

  if (!chat) {
    throw new ApiErrorClass("Chat not found", 404);
  }

  // Check if user is participant
  const isParticipant = chat.participants.some(
    (participant: any) => participant._id.toString() === req.user._id.toString()
  );

  if (!isParticipant) {
    throw new ApiErrorClass("Access denied", 403);
  }

  res.json({
    success: true,
    data: chat,
  });
});

// @desc    Send message
// @route   POST /api/chat/:id/messages
// @access  Private
export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const { content, type = "text" } = req.body;
  const chatId = req.params.id;

  if (!content) {
    throw new ApiErrorClass("Message content is required", 400);
  }

  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw new ApiErrorClass("Chat not found", 404);
  }

  // Check if user is participant
  const isParticipant = chat.participants.some(
    (participantId) => participantId.toString() === req.user._id.toString()
  );

  if (!isParticipant) {
    throw new ApiErrorClass("Access denied", 403);
  }

  // Create message
  const message = {
    sender: req.user._id,
    content,
    type,
    timestamp: new Date(),
    readBy: [
      {
        user: req.user._id,
        readAt: new Date(),
      },
    ],
  };

  // Add message to chat
  chat.messages.push(message as any);
  chat.lastMessage = content;
  chat.lastMessageAt = new Date();
  await chat.save();

  // Populate the new message
  const populatedChat = await Chat.findById(chatId).populate({
    path: "messages",
    populate: {
      path: "sender",
      select: "fullName avatar",
    },
  });

  const newMessage =
    populatedChat!.messages[populatedChat!.messages.length - 1];

  // Emit to socket (will be handled by socket middleware)
  req.io?.to(chatId).emit("new_message", {
    chatId,
    message: newMessage,
  });

  res.json({
    success: true,
    data: newMessage,
  });
});

// @desc    Mark messages as read
// @route   PUT /api/chat/:id/read
// @access  Private
export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const chatId = req.params.id;

  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw new ApiErrorClass("Chat not found", 404);
  }

  // Check if user is participant
  const isParticipant = chat.participants.some(
    (participantId) => participantId.toString() === req.user._id.toString()
  );

  if (!isParticipant) {
    throw new ApiErrorClass("Access denied", 403);
  }

  // Mark unread messages as read
  const updated = await Chat.updateOne(
    {
      _id: chatId,
      "messages.readBy.user": { $ne: req.user._id },
    },
    {
      $push: {
        "messages.$[message].readBy": {
          user: req.user._id,
          readAt: new Date(),
        },
      },
    },
    {
      arrayFilters: [
        {
          "message.sender": { $ne: req.user._id },
          "message.readBy.user": { $ne: req.user._id },
        },
      ],
    }
  );

  res.json({
    success: true,
    message: "Messages marked as read",
  });
});



