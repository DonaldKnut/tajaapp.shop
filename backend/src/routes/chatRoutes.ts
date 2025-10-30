import express from "express";
import { protect } from "../middleware/authMiddleware";
import { asyncHandler, ApiErrorClass } from "../middleware/errorMiddleware";
import Chat from "../models/Chat";

const router = express.Router();

// @desc    Get user's chats
// @route   GET /api/chat
// @access  Private
router.get(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const chats = await Chat.findUserChats(req.user._id);

    res.json({
      success: true,
      data: chats,
    });
  })
);

// @desc    Start or get existing chat
// @route   POST /api/chat
// @access  Private
router.post(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const { participantId, productId, shopId } = req.body;

    // Check if chat already exists
    let chat = await Chat.findByParticipants(
      req.user._id,
      participantId,
      productId
    );

    if (!chat) {
      // Create new chat
      chat = await Chat.create({
        participants: [req.user._id, participantId],
        product: productId,
        shop: shopId,
      });
    }

    res.json({
      success: true,
      data: chat,
      message: chat.isNew ? "Chat created" : "Chat retrieved",
    });
  })
);

// @desc    Send message
// @route   POST /api/chat/:id/messages
// @access  Private
router.post(
  "/:id/messages",
  protect,
  asyncHandler(async (req, res) => {
    const { content, type, attachments, metadata } = req.body;

    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      throw new ApiErrorClass("Chat not found", 404);
    }

    if (!chat.isParticipant(req.user._id)) {
      throw new ApiErrorClass(
        "Not authorized to send messages in this chat",
        403
      );
    }

    await chat.addMessage(req.user._id, content, type, attachments, metadata);

    res.json({
      success: true,
      message: "Message sent successfully",
    });
  })
);

// @desc    Mark messages as read
// @route   PUT /api/chat/:id/read
// @access  Private
router.put(
  "/:id/read",
  protect,
  asyncHandler(async (req, res) => {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      throw new ApiErrorClass("Chat not found", 404);
    }

    if (!chat.isParticipant(req.user._id)) {
      throw new ApiErrorClass("Not authorized", 403);
    }

    await chat.markAsRead(req.user._id);

    res.json({
      success: true,
      message: "Messages marked as read",
    });
  })
);

export default router;



