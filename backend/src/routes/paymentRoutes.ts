import express from "express";
import { protect } from "../middleware/authMiddleware";
import { asyncHandler, ApiErrorClass } from "../middleware/errorMiddleware";
import { flutterwaveService } from "../utils/flutterwave";
import { Order, Transaction, User } from "../models";

const router = express.Router();

// @desc    Initialize payment
// @route   POST /api/payments/initialize
// @access  Private
router.post(
  "/initialize",
  protect,
  asyncHandler(async (req, res) => {
    const { orderId, paymentMethod = "card" } = req.body;

    // Get order details
    const order = await Order.findById(orderId)
      .populate("buyer", "fullName email phone")
      .populate("seller", "fullName email")
      .populate("shop", "shopName");

    if (!order) {
      throw new ApiErrorClass("Order not found", 404);
    }

    // Verify user is the buyer
    if (order.buyer._id.toString() !== req.user._id.toString()) {
      throw new ApiErrorClass("Not authorized", 403);
    }

    // Check if order is already paid
    if (order.paymentStatus === "paid" || order.paymentStatus === "escrowed") {
      throw new ApiErrorClass("Order already paid", 400);
    }

    const tx_ref = `TJS_${order.orderNumber}_${Date.now()}`;

    try {
      const paymentData = {
        tx_ref,
        amount: order.totals.total,
        currency: "NGN",
        redirect_url: `${process.env.FRONTEND_URL}/orders/${order._id}/success`,
        payment_options: "card,banktransfer,ussd",
        customer: {
          email: (order as any).buyer?.email,
          phonenumber: (order as any).buyer?.phone,
          name: (order as any).buyer?.fullName,
        },
        customizations: {
          title: "Taja.Shop Payment",
          description: `Payment for order ${order.orderNumber}`,
          logo: `${process.env.FRONTEND_URL}/logo.png`,
        },
        meta: {
          orderId: order._id.toString(),
          shopId: ((order as any).shop?._id ?? (order as any).shop)?.toString(),
        },
      };

      const response = await flutterwaveService.initializePayment(paymentData);

      // Create transaction record
      await Transaction.create({
        user: req.user._id,
        order: order._id,
        type: "payment",
        amount: order.totals.total,
        currency: "NGN",
        status: "pending",
        gateway: "flutterwave",
        reference: tx_ref,
        description: `Payment for order ${order.orderNumber}`,
      });

      // Update order payment reference
      order.paymentReference = tx_ref;
      order.paymentMethod = paymentMethod;
      await order.save();

      res.json({
        success: true,
        data: {
          paymentUrl: response.data.link,
          reference: tx_ref,
        },
        message: "Payment initialized successfully",
      });
    } catch (error: any) {
      throw new ApiErrorClass(
        error.message || "Payment initialization failed",
        500
      );
    }
  })
);

// @desc    Verify payment
// @route   GET /api/payments/verify/:reference
// @access  Private
router.get(
  "/verify/:reference",
  protect,
  asyncHandler(async (req, res) => {
    const { reference } = req.params;

    try {
      // Find transaction
      const transaction = await Transaction.findOne({ reference })
        .populate("order")
        .populate("user");

      if (!transaction) {
        throw new ApiErrorClass("Transaction not found", 404);
      }

      // Verify with Flutterwave
      const verification = await flutterwaveService.verifyPayment(reference);

      if (
        verification.status === "successful" &&
        verification.data.status === "successful"
      ) {
        // Update transaction status
        transaction.status = "successful";
        transaction.gatewayResponse = verification.data;
        await transaction.save();

        // Update order
        const order = transaction.order as any;
        if (order) {
          // Create actual escrow hold with Flutterwave
          try {
            const escrow = await flutterwaveService.createEscrow({
              tx_ref: verification.data.tx_ref,
              amount: order.totals.total,
              currency: "NGN",
              customer: {
                email: order.buyer.email,
                name: order.buyer.fullName,
              },
              seller: {
                email: order.seller.email,
                name: order.seller.fullName,
              },
              title: `Order ${order.orderNumber}`,
              description: `Escrow for order ${order.orderNumber} - ${order.items.length} item(s)`,
            });

            // Update order with escrow information
            order.paymentStatus = "escrowed";
            order.escrowStatus = "funded";
            order.escrowReference = escrow.data?.id || escrow.data?.escrow_id;
            order.escrowCreatedAt = new Date();
            await order.save();

            console.log(
              `[ESCROW] Created escrow hold for order ${order.orderNumber}: ${order.escrowReference}`
            );
          } catch (escrowError: any) {
            // If escrow creation fails, still mark as paid but log error
            console.error(
              `[ESCROW ERROR] Failed to create escrow for order ${order.orderNumber}:`,
              escrowError.message
            );
            order.paymentStatus = "paid"; // Fallback to regular payment
            order.escrowStatus = "pending";
            await order.save();

            // Note: In production, you might want to reject the payment if escrow fails
            // For now, we'll allow it but flag for review
            await User.findByIdAndUpdate(order.seller, {
              $set: {
                "fraudFlags.suspiciousActivity": true,
                accountStatus: "under_review",
              },
            });
          }
        }

        res.json({
          success: true,
          data: {
            status: "successful",
            reference,
            order: order?.orderNumber,
          },
          message: "Payment verified successfully",
        });
      } else {
        // Payment failed
        transaction.status = "failed";
        transaction.gatewayResponse = verification.data;
        await transaction.save();

        const order = transaction.order as any;
        if (order) {
          order.paymentStatus = "failed";
          await order.save();
        }

        res.json({
          success: false,
          data: {
            status: "failed",
            reference,
          },
          message: "Payment verification failed",
        });
      }
    } catch (error: any) {
      throw new ApiErrorClass(
        error.message || "Payment verification failed",
        500
      );
    }
  })
);

// @desc    Release escrow payment to seller
// @route   POST /api/payments/release-escrow
// @access  Private
router.post(
  "/release-escrow",
  protect,
  asyncHandler(async (req, res) => {
    const { orderId } = req.body;

    const order = await Order.findById(orderId)
      .populate("buyer")
      .populate("seller");

    if (!order) {
      throw new ApiErrorClass("Order not found", 404);
    }

    // Only buyer can release escrow (after confirming delivery)
    if (order.buyer._id.toString() !== req.user._id.toString()) {
      throw new ApiErrorClass("Not authorized", 403);
    }

    // Check if order is delivered and escrow is funded
    if (order.status !== "delivered" || order.escrowStatus !== "funded") {
      throw new ApiErrorClass("Cannot release escrow at this time", 400);
    }

    try {
      // Release escrow using Flutterwave API
      if (order.escrowReference) {
        const releaseResult = await flutterwaveService.releaseEscrow(
          order.escrowReference
        );

        if (releaseResult.status === "success") {
          // Update order status
          order.escrowStatus = "released";
          order.paymentStatus = "paid";
          order.escrowReleasedAt = new Date();
          await order.save();

          console.log(
            `[ESCROW] Released escrow for order ${order.orderNumber}: ${order.escrowReference}`
          );

          // Create payout transaction for seller
          const sellerAmount = order.totals.total * 0.95; // Minus 5% platform fee
          const platformFee = order.totals.total * 0.05;

          await Transaction.create({
            user: order.seller._id,
            order: order._id,
            type: "payout",
            amount: sellerAmount,
            currency: "NGN",
            status: "successful",
            gateway: "flutterwave",
            reference: `PAYOUT_${order.orderNumber}_${Date.now()}`,
            description: `Payout for order ${order.orderNumber}`,
          });

          // Record platform fee
          await Transaction.create({
            user: order.seller._id,
            order: order._id,
            type: "fee",
            amount: platformFee,
            currency: "NGN",
            status: "successful",
            gateway: "flutterwave",
            reference: `FEE_${order.orderNumber}_${Date.now()}`,
            description: `Platform fee for order ${order.orderNumber}`,
          });

          res.json({
            success: true,
            message: "Escrow released successfully",
            data: {
              orderNumber: order.orderNumber,
              sellerAmount,
              platformFee,
            },
          });
        } else {
          throw new ApiErrorClass(
            releaseResult.message || "Escrow release failed",
            500
          );
        }
      } else {
        // Fallback: No escrow reference, mark as released anyway (legacy orders)
        order.escrowStatus = "released";
        order.paymentStatus = "paid";
        await order.save();

        res.json({
          success: true,
          message: "Order marked as paid (no escrow reference found)",
        });
      }
    } catch (error: any) {
      console.error(
        `[ESCROW ERROR] Failed to release escrow for order ${order.orderNumber}:`,
        error.message
      );
      throw new ApiErrorClass(error.message || "Escrow release failed", 500);
    }
  })
);

// @desc    Refund payment
// @route   POST /api/payments/refund
// @access  Private
router.post(
  "/refund",
  protect,
  asyncHandler(async (req, res) => {
    const { orderId, reason } = req.body;

    const order = await Order.findById(orderId)
      .populate("buyer")
      .populate("seller");

    if (!order) {
      throw new ApiErrorClass("Order not found", 404);
    }

    // Check authorization (buyer, seller, or admin)
    const isAuthorized =
      order.buyer._id.toString() === req.user._id.toString() ||
      order.seller._id.toString() === req.user._id.toString() ||
      req.user.role === "admin";

    if (!isAuthorized) {
      throw new ApiErrorClass("Not authorized", 403);
    }

    // Check if refund is possible
    if (
      !["paid", "escrowed"].includes(order.paymentStatus) ||
      order.escrowStatus === "released"
    ) {
      throw new ApiErrorClass("Refund not possible", 400);
    }

    try {
      // Find original payment transaction
      const originalTransaction = await Transaction.findOne({
        order: order._id,
        type: "payment",
        status: "successful",
      });

      if (!originalTransaction) {
        throw new ApiErrorClass("Original transaction not found", 404);
      }

      // Create refund transaction
      const refundTransaction = await Transaction.create({
        user: order.buyer._id,
        order: order._id,
        type: "refund",
        amount: order.totals.total,
        currency: "NGN",
        status: "pending",
        gateway: "flutterwave",
        reference: `REFUND_${order.orderNumber}_${Date.now()}`,
        description: `Refund for order ${order.orderNumber}: ${reason}`,
      });

      // In a real implementation, process refund with Flutterwave
      // For now, simulate successful refund
      refundTransaction.status = "successful";
      await refundTransaction.save();

      // Update order status
      order.paymentStatus = "refunded";
      order.escrowStatus = "refunded";
      order.status = "refunded";
      await order.save();

      res.json({
        success: true,
        message: "Refund processed successfully",
      });
    } catch (error: any) {
      throw new ApiErrorClass(error.message || "Refund failed", 500);
    }
  })
);

// @desc    Get user transactions
// @route   GET /api/payments/transactions
// @access  Private
router.get(
  "/transactions",
  protect,
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const type = req.query.type as string;

    const transactions = await Transaction.getUserTransactions(
      req.user._id,
      type,
      page,
      limit
    );

    const total = await Transaction.countDocuments({ user: req.user._id });

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  })
);

// @desc    Webhook handler for Flutterwave
// @route   POST /api/payments/webhook
// @access  Public
router.post(
  "/webhook",
  asyncHandler(async (req, res) => {
    try {
      const payload = req.body;

      // Verify webhook signature (implement this based on Flutterwave docs)
      // const signature = req.headers['verif-hash'];
      // if (!flutterwaveService.verifyWebhookSignature(signature, payload)) {
      //   throw new ApiErrorClass('Invalid signature', 400);
      // }

      const { data } = payload;
      const { tx_ref, status } = data;

      // Find transaction
      const transaction = await Transaction.findOne({
        reference: tx_ref,
      }).populate("order");

      if (transaction) {
        // Update transaction status based on webhook
        if (status === "successful") {
          transaction.status = "successful";
          transaction.gatewayResponse = data;

          // Update order
          const order = transaction.order as any;
          if (order) {
            order.paymentStatus = "escrowed";
            order.escrowStatus = "funded";
            await order.save();
          }
        } else {
          transaction.status = "failed";
          transaction.gatewayResponse = data;
        }

        await transaction.save();
      }

      res.status(200).json({ received: true });
    } catch (error: any) {
      console.error("Webhook error:", error);
      res.status(400).json({ error: error.message });
    }
  })
);

export default router;
