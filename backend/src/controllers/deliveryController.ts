import { Request, Response } from "express";
import { Order } from "../models";
import { asyncHandler, ApiErrorClass } from "../middleware/errorMiddleware";
import { deliveryService } from "../utils/deliveryProviders";

// @desc    Get delivery estimates
// @route   POST /api/delivery/estimate
// @access  Private
export const getDeliveryEstimate = asyncHandler(
  async (req: Request, res: Response) => {
    const { pickupAddress, deliveryAddress } = req.body;

    if (!pickupAddress || !deliveryAddress) {
      throw new ApiErrorClass(
        "Pickup and delivery addresses are required",
        400
      );
    }

    const estimates = await deliveryService.getAllDeliveryEstimates(
      pickupAddress,
      deliveryAddress
    );

    res.json({
      success: true,
      data: estimates,
      message: "Delivery estimates retrieved",
    });
  }
);

// @desc    Book delivery for order
// @route   POST /api/delivery/book
// @access  Private
export const bookDelivery = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      orderId,
      provider,
      pickupAddress,
      deliveryAddress,
      recipientPhone,
      packageDescription,
      packageValue,
    } = req.body;

    if (
      !orderId ||
      !provider ||
      !pickupAddress ||
      !deliveryAddress ||
      !recipientPhone
    ) {
      throw new ApiErrorClass("Missing required fields", 400);
    }

    // Get the order and verify ownership
    const order = await Order.findById(orderId).populate("seller buyer");
    if (!order) {
      throw new ApiErrorClass("Order not found", 404);
    }

    // Check if user is the seller of this order
    if (order.seller._id.toString() !== req.user._id.toString()) {
      throw new ApiErrorClass(
        "Only the seller can book delivery for this order",
        403
      );
    }

    // Check order status - should be confirmed/processing
    if (!["confirmed", "processing"].includes(order.status)) {
      throw new ApiErrorClass("Order must be confirmed to book delivery", 400);
    }

    try {
      // Book delivery with selected provider
      const deliveryBooking = await deliveryService.bookDelivery(
        provider,
        pickupAddress,
        deliveryAddress,
        recipientPhone,
        packageDescription ||
          order.items.map((item) => item.product.title).join(", "),
        packageValue || order.totalAmount
      );

      // Update order with delivery info
      order.deliveryInfo = {
        trackingNumber: deliveryBooking.trackingNumber,
        provider: deliveryBooking.provider,
        estimatedDelivery: deliveryBooking.estimatedDelivery,
        status: "confirmed",
        cost: deliveryBooking.cost,
      };

      // Update order status
      order.status = "shipped";
      order.timeline.push({
        status: "shipped",
        timestamp: new Date(),
        note: `Package shipped via ${deliveryBooking.provider}`,
      });

      await order.save();

      // TODO: Send notification to buyer
      // TODO: Emit socket event for real-time updates

      res.json({
        success: true,
        data: {
          trackingNumber: deliveryBooking.trackingNumber,
          provider: deliveryBooking.provider,
          estimatedDelivery: deliveryBooking.estimatedDelivery,
          cost: deliveryBooking.cost,
        },
        message: "Delivery booked successfully",
      });
    } catch (error) {
      console.error("Delivery booking error:", error);
      throw new ApiErrorClass("Failed to book delivery", 500);
    }
  }
);

// @desc    Track delivery
// @route   GET /api/delivery/track/:trackingNumber
// @access  Private
export const trackDelivery = asyncHandler(
  async (req: Request, res: Response) => {
    const { trackingNumber } = req.params;

    // Find order by tracking number
    const order = await Order.findOne({
      "deliveryInfo.trackingNumber": trackingNumber,
    }).populate("buyer seller");

    if (!order) {
      throw new ApiErrorClass("Order not found for this tracking number", 404);
    }

    // Check if user is buyer or seller of this order
    const isAuthorized = [
      order.buyer._id.toString(),
      order.seller._id.toString(),
    ].includes(req.user._id.toString());

    if (!isAuthorized) {
      throw new ApiErrorClass("Not authorized to track this delivery", 403);
    }

    try {
      // Get tracking updates from delivery provider
      const trackingUpdates = await deliveryService.trackDelivery(
        order.deliveryInfo.provider,
        trackingNumber
      );

      res.json({
        success: true,
        data: {
          order: {
            _id: order._id,
            orderNumber: order.orderNumber,
            status: order.status,
          },
          deliveryInfo: order.deliveryInfo,
          trackingUpdates,
        },
        message: "Tracking information retrieved",
      });
    } catch (error) {
      console.error("Delivery tracking error:", error);
      throw new ApiErrorClass("Failed to retrieve tracking information", 500);
    }
  }
);

// @desc    Handle delivery webhook
// @route   POST /api/delivery/webhook/:provider
// @access  Public (but should validate webhook signature)
export const handleDeliveryWebhook = asyncHandler(
  async (req: Request, res: Response) => {
    const { provider } = req.params;
    const payload = req.body;

    // TODO: Validate webhook signature for security

    try {
      await deliveryService.handleDeliveryWebhook(provider, payload);

      // Extract tracking number from payload (varies by provider)
      let trackingNumber = "";
      if (provider === "gokada") {
        trackingNumber = payload.tracking_number || payload.delivery_id;
      } else if (provider === "kwik") {
        trackingNumber = payload.tracking_id || payload.delivery_id;
      }

      if (trackingNumber) {
        // Find and update order
        const order = await Order.findOne({
          "deliveryInfo.trackingNumber": trackingNumber,
        });

        if (order) {
          // Update delivery status based on webhook data
          const newStatus = mapProviderStatusToInternal(payload.status);

          if (newStatus && newStatus !== order.deliveryInfo.status) {
            order.deliveryInfo.status = newStatus;

            // Update current location if provided
            if (payload.current_location) {
              order.deliveryInfo.currentLocation = payload.current_location;
            }

            // Add timeline entry for significant status changes
            if (["delivered", "failed"].includes(newStatus)) {
              order.timeline.push({
                status: newStatus === "delivered" ? "delivered" : "failed",
                timestamp: new Date(),
                note: payload.message || `Package ${newStatus}`,
              });

              // Update main order status if delivered
              if (newStatus === "delivered") {
                order.status = "delivered";
              }
            }

            await order.save();

            // TODO: Send real-time notification via Socket.io
            // TODO: Send SMS/email notification for important updates
          }
        }
      }

      res.json({ received: true });
    } catch (error) {
      console.error("Webhook handling error:", error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  }
);

// @desc    Get order delivery status
// @route   GET /api/delivery/order/:orderId
// @access  Private
export const getOrderDeliveryStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate("buyer seller");
    if (!order) {
      throw new ApiErrorClass("Order not found", 404);
    }

    // Check if user is buyer or seller of this order
    const isAuthorized = [
      order.buyer._id.toString(),
      order.seller._id.toString(),
    ].includes(req.user._id.toString());

    if (!isAuthorized) {
      throw new ApiErrorClass("Not authorized to view this order", 403);
    }

    let trackingUpdates = [];

    // If there's a tracking number, get live tracking info
    if (order.deliveryInfo?.trackingNumber) {
      try {
        trackingUpdates = await deliveryService.trackDelivery(
          order.deliveryInfo.provider,
          order.deliveryInfo.trackingNumber
        );
      } catch (error) {
        console.error("Error fetching live tracking:", error);
        // Continue without live updates
      }
    }

    res.json({
      success: true,
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        deliveryInfo: order.deliveryInfo,
        timeline: order.timeline,
        liveTracking: trackingUpdates,
      },
      message: "Delivery status retrieved",
    });
  }
);

// Helper function to map provider status to internal status
function mapProviderStatusToInternal(providerStatus: string): string {
  const statusMap: { [key: string]: string } = {
    // Gokada statuses
    pickup_confirmed: "confirmed",
    in_transit: "in_transit",
    out_for_delivery: "out_for_delivery",
    delivered: "delivered",
    failed: "failed",

    // Kwik statuses
    accepted: "confirmed",
    picked_up: "in_transit",
    on_the_way: "out_for_delivery",
    completed: "delivered",
    cancelled: "failed",

    // General statuses
    confirmed: "confirmed",
    shipped: "in_transit",
    delivery: "out_for_delivery",
    success: "delivered",
    error: "failed",
  };

  return statusMap[providerStatus.toLowerCase()] || providerStatus;
}



