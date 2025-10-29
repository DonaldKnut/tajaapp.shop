import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

interface Notification {
  _id: string;
  type:
    | "order"
    | "payment"
    | "chat"
    | "review"
    | "shop"
    | "system"
    | "promotion";
  title: string;
  message: string;
  read: boolean;
  priority: "low" | "normal" | "high" | "urgent";
  actionUrl?: string;
  createdAt: Date;
}

// Mock notifications data
const mockNotifications: Notification[] = [
  {
    _id: "1",
    type: "order",
    title: "Order Shipped!",
    message: "Your order #TJS001234 is on its way to you",
    read: false,
    priority: "high",
    actionUrl: "/orders/1",
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
  },
  {
    _id: "2",
    type: "payment",
    title: "Payment Confirmed",
    message: "Your payment of ₦25,000 has been processed successfully",
    read: false,
    priority: "normal",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    _id: "3",
    type: "chat",
    title: "New Message",
    message: "Amina replied to your inquiry about the vintage jacket",
    read: true,
    priority: "normal",
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
  },
  {
    _id: "4",
    type: "promotion",
    title: "Flash Sale Alert! 🔥",
    message: "50% off on selected items. Limited time offer!",
    read: true,
    priority: "low",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
];

const getNotificationIcon = (type: string, priority: string) => {
  const iconColor =
    priority === "urgent"
      ? "#EF4444"
      : priority === "high"
      ? "#F59E0B"
      : "#6B7280";

  switch (type) {
    case "order":
      return <Ionicons name="cube" size={20} color={iconColor} />;
    case "payment":
      return <Ionicons name="card" size={20} color={iconColor} />;
    case "chat":
      return <Ionicons name="chatbubble" size={20} color={iconColor} />;
    case "review":
      return <Ionicons name="star" size={20} color={iconColor} />;
    case "promotion":
      return <Ionicons name="pricetag" size={20} color={iconColor} />;
    case "system":
      return <Ionicons name="information-circle" size={20} color={iconColor} />;
    default:
      return <Ionicons name="notifications" size={20} color={iconColor} />;
  }
};

const timeAgo = (date: Date) => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInHours < 1) {
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    return diffInMinutes < 1 ? "Just now" : `${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else {
    return `${diffInDays}d ago`;
  }
};

export default function NotificationsScreen() {
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const navigation = useNavigation();

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filteredNotifications =
    filter === "unread" ? notifications.filter((n) => !n.read) : notifications;

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (notificationId: string) => {
    Alert.alert(
      "Delete Notification",
      "Are you sure you want to delete this notification?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setNotifications((prev) =>
              prev.filter((n) => n._id !== notificationId)
            );
          },
        },
      ]
    );
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.notificationCard, !item.read && styles.unreadCard]}
      onPress={() => {
        if (!item.read) {
          markAsRead(item._id);
        }
        // TODO: Navigate to action URL
      }}
    >
      <View style={styles.notificationHeader}>
        <View style={styles.iconContainer}>
          {getNotificationIcon(item.type, item.priority)}
        </View>

        <View style={styles.notificationContent}>
          <View style={styles.titleRow}>
            <Text
              style={[
                styles.notificationTitle,
                !item.read && styles.unreadTitle,
              ]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <View style={styles.metaInfo}>
              <Text style={styles.timeText}>{timeAgo(item.createdAt)}</Text>
              {!item.read && <View style={styles.unreadDot} />}
            </View>
          </View>

          <Text style={styles.notificationMessage} numberOfLines={2}>
            {item.message}
          </Text>

          {item.priority === "urgent" && (
            <View style={styles.priorityBadge}>
              <Text style={styles.priorityText}>Urgent</Text>
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={(e) => {
          e.stopPropagation();
          deleteNotification(item._id);
        }}
      >
        <Ionicons name="trash-outline" size={16} color="#9CA3AF" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => {
            // TODO: Navigate to notification settings
          }}
        >
          <Ionicons name="settings-outline" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, filter === "all" && styles.activeFilterTab]}
          onPress={() => setFilter("all")}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === "all" && styles.activeFilterTabText,
            ]}
          >
            All ({notifications.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === "unread" && styles.activeFilterTab,
          ]}
          onPress={() => setFilter("unread")}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === "unread" && styles.activeFilterTabText,
            ]}
          >
            Unread ({unreadCount})
          </Text>
        </TouchableOpacity>

        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={markAllAsRead}
          >
            <Ionicons name="checkmark-done" size={16} color="#10B981" />
            <Text style={styles.markAllButtonText}>Mark All Read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons
            name={
              filter === "unread" ? "checkmark-circle" : "notifications-off"
            }
            size={64}
            color="#9CA3AF"
          />
          <Text style={styles.emptyStateTitle}>
            {filter === "unread" ? "All caught up!" : "No notifications"}
          </Text>
          <Text style={styles.emptyStateText}>
            {filter === "unread"
              ? "You have no unread notifications"
              : "You don't have any notifications yet"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredNotifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
  },
  unreadBadge: {
    backgroundColor: "#EF4444",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
    minWidth: 24,
  },
  unreadBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  settingsButton: {
    padding: 8,
  },
  filterContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  activeFilterTab: {
    backgroundColor: "#10B981",
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  activeFilterTabText: {
    color: "#FFFFFF",
  },
  markAllButton: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "auto",
  },
  markAllButtonText: {
    fontSize: 12,
    color: "#10B981",
    fontWeight: "500",
    marginLeft: 4,
  },
  listContainer: {
    padding: 16,
  },
  notificationCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
    backgroundColor: "#F0FDF4",
  },
  notificationHeader: {
    flexDirection: "row",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
    flex: 1,
  },
  unreadTitle: {
    color: "#1F2937",
    fontWeight: "600",
  },
  metaInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 8,
  },
  priorityBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#DC2626",
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
});



