import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

interface WishlistItem {
  _id: string;
  product: {
    _id: string;
    title: string;
    price: number;
    images: string[];
    shop: {
      shopName: string;
      isVerified: boolean;
    };
  };
  addedAt: Date;
}

// Mock wishlist data
const mockWishlistItems: WishlistItem[] = [
  {
    _id: "1",
    product: {
      _id: "1",
      title: "Vintage Denim Jacket",
      price: 15000,
      images: [
        "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400",
      ],
      shop: {
        shopName: "Amina Thrift",
        isVerified: true,
      },
    },
    addedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    _id: "2",
    product: {
      _id: "2",
      title: "Handmade Leather Bag",
      price: 25000,
      images: [
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400",
      ],
      shop: {
        shopName: "Kemi Crafts",
        isVerified: true,
      },
    },
    addedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
];

export default function WishlistScreen() {
  const [wishlistItems, setWishlistItems] =
    useState<WishlistItem[]>(mockWishlistItems);
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const removeFromWishlist = async (itemId: string) => {
    Alert.alert(
      "Remove Item",
      "Are you sure you want to remove this item from your wishlist?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            setWishlistItems((prev) =>
              prev.filter((item) => item._id !== itemId)
            );
          },
        },
      ]
    );
  };

  const moveToCart = async (item: WishlistItem) => {
    // TODO: Implement move to cart functionality
    Alert.alert(
      "Added to Cart",
      `${item.product.title} has been added to your cart!`
    );
  };

  const renderWishlistItem = ({ item }: { item: WishlistItem }) => (
    <View style={styles.itemCard}>
      <TouchableOpacity
        style={styles.itemContent}
        onPress={() =>
          navigation.navigate(
            "ProductDetail" as never,
            { productId: item.product._id } as never
          )
        }
      >
        <Image
          source={{
            uri: item.product.images[0] || "https://via.placeholder.com/200",
          }}
          style={styles.productImage}
          resizeMode="cover"
        />

        <View style={styles.productInfo}>
          <Text style={styles.productTitle} numberOfLines={2}>
            {item.product.title}
          </Text>

          <Text style={styles.productPrice}>
            {formatPrice(item.product.price)}
          </Text>

          <View style={styles.shopInfo}>
            <Text style={styles.shopName} numberOfLines={1}>
              {item.product.shop.shopName}
            </Text>
            {item.product.shop.isVerified && (
              <Ionicons name="checkmark-circle" size={14} color="#10B981" />
            )}
          </View>

          <Text style={styles.addedDate}>
            Added{" "}
            {Math.floor(
              (Date.now() - new Date(item.addedAt).getTime()) /
                (1000 * 60 * 60 * 24)
            )}{" "}
            days ago
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.cartButton]}
          onPress={() => moveToCart(item)}
        >
          <Ionicons name="bag-add" size={16} color="#FFFFFF" />
          <Text style={styles.cartButtonText}>Add to Cart</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.removeButton]}
          onPress={() => removeFromWishlist(item._id)}
        >
          <Ionicons name="trash-outline" size={16} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Wishlist</Text>
        <Text style={styles.itemCount}>
          {wishlistItems.length} item{wishlistItems.length !== 1 ? "s" : ""}
        </Text>
      </View>

      {/* Wishlist Items */}
      {wishlistItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="heart-outline" size={64} color="#9CA3AF" />
          <Text style={styles.emptyStateTitle}>Your wishlist is empty</Text>
          <Text style={styles.emptyStateText}>
            Save items you love to buy them later
          </Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => navigation.navigate("Marketplace" as never)}
          >
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={wishlistItems}
            renderItem={renderWishlistItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />

          {/* Bottom Actions */}
          <View style={styles.bottomActions}>
            <TouchableOpacity
              style={styles.clearAllButton}
              onPress={() => {
                Alert.alert(
                  "Clear Wishlist",
                  "Are you sure you want to remove all items from your wishlist?",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Clear All",
                      style: "destructive",
                      onPress: () => setWishlistItems([]),
                    },
                  ]
                );
              }}
            >
              <Ionicons name="trash-outline" size={16} color="#EF4444" />
              <Text style={styles.clearAllButtonText}>Clear All</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.addAllToCartButton}
              onPress={() => {
                Alert.alert(
                  "Added to Cart",
                  "All wishlist items added to cart!"
                );
              }}
            >
              <Ionicons name="bag-add-outline" size={16} color="#FFFFFF" />
              <Text style={styles.addAllToCartButtonText}>Add All to Cart</Text>
            </TouchableOpacity>
          </View>
        </>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
  },
  itemCount: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  listContainer: {
    padding: 16,
  },
  itemCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  itemContent: {
    flexDirection: "row",
    padding: 12,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#10B981",
    marginBottom: 8,
  },
  shopInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  shopName: {
    fontSize: 12,
    color: "#6B7280",
    flex: 1,
  },
  addedDate: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  actions: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    flex: 1,
  },
  cartButton: {
    backgroundColor: "#10B981",
    flex: 2,
  },
  cartButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
  },
  removeButton: {
    backgroundColor: "#FEF2F2",
    flex: 0,
    paddingHorizontal: 12,
  },
  bottomActions: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 12,
  },
  clearAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#FEF2F2",
    flex: 1,
  },
  clearAllButtonText: {
    color: "#EF4444",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
  },
  addAllToCartButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#10B981",
    flex: 2,
  },
  addAllToCartButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
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
    marginBottom: 24,
  },
  shopButton: {
    backgroundColor: "#10B981",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  shopButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});




