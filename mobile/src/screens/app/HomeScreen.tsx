import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import { productsAPI, shopsAPI } from "../../services/api";

const { width } = Dimensions.get("window");

interface Product {
  _id: string;
  title: string;
  price: number;
  images: string[];
  shop: {
    shopName: string;
    isVerified: boolean;
  };
}

interface Shop {
  _id: string;
  shopName: string;
  shopSlug: string;
  logo?: string;
  isVerified: boolean;
  productsCount: number;
}

export default function HomeScreen() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [popularShops, setPopularShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const navigation = useNavigation();
  const { user } = useAuth();

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      const [productsResponse, shopsResponse] = await Promise.all([
        productsAPI.getFeaturedProducts(),
        shopsAPI.getShops(),
      ]);

      if (productsResponse.success) {
        setFeaturedProducts(productsResponse.data || []);
      }

      if (shopsResponse.success) {
        setPopularShops(shopsResponse.data?.slice(0, 10) || []);
      }
    } catch (error) {
      console.error("Error loading home data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadHomeData();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() =>
        navigation.navigate(
          "ProductDetail" as never,
          { productId: item._id } as never
        )
      }
    >
      <Image
        source={{ uri: item.images[0] || "https://via.placeholder.com/200" }}
        style={styles.productImage}
        resizeMode="cover"
      />
      <View style={styles.productInfo}>
        <Text style={styles.productTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
        <View style={styles.shopInfo}>
          <Text style={styles.shopName} numberOfLines={1}>
            {item.shop.shopName}
          </Text>
          {item.shop.isVerified && (
            <Ionicons name="checkmark-circle" size={14} color="#10B981" />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderShop = ({ item }: { item: Shop }) => (
    <TouchableOpacity
      style={styles.shopCard}
      onPress={() =>
        navigation.navigate(
          "Shop" as never,
          { shopSlug: item.shopSlug } as never
        )
      }
    >
      <View style={styles.shopLogo}>
        {item.logo ? (
          <Image source={{ uri: item.logo }} style={styles.shopLogoImage} />
        ) : (
          <View style={styles.shopLogoPlaceholder}>
            <Text style={styles.shopLogoText}>
              {item.shopName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.shopCardInfo}>
        <View style={styles.shopNameRow}>
          <Text style={styles.shopCardName} numberOfLines={1}>
            {item.shopName}
          </Text>
          {item.isVerified && (
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
          )}
        </View>
        <Text style={styles.shopProductCount}>
          {item.productsCount} products
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Hello, {user?.fullName.split(" ")[0] || "there"}! 👋
            </Text>
            <Text style={styles.subGreeting}>
              What are you looking for today?
            </Text>
          </View>
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => navigation.navigate("Cart" as never)}
          >
            <Ionicons name="bag-outline" size={24} color="#1F2937" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => navigation.navigate("Marketplace" as never)}
        >
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <Text style={styles.searchPlaceholder}>
            Search products, shops...
          </Text>
        </TouchableOpacity>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction}>
            <View
              style={[styles.quickActionIcon, { backgroundColor: "#FEF3C7" }]}
            >
              <Ionicons name="flash" size={20} color="#F59E0B" />
            </View>
            <Text style={styles.quickActionText}>Flash Sale</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickAction}>
            <View
              style={[styles.quickActionIcon, { backgroundColor: "#DBEAFE" }]}
            >
              <Ionicons name="star" size={20} color="#3B82F6" />
            </View>
            <Text style={styles.quickActionText}>Top Rated</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickAction}>
            <View
              style={[styles.quickActionIcon, { backgroundColor: "#D1FAE5" }]}
            >
              <Ionicons name="pricetag" size={20} color="#10B981" />
            </View>
            <Text style={styles.quickActionText}>Best Deals</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickAction}>
            <View
              style={[styles.quickActionIcon, { backgroundColor: "#FCE7F3" }]}
            >
              <Ionicons name="shirt" size={20} color="#EC4899" />
            </View>
            <Text style={styles.quickActionText}>Fashion</Text>
          </TouchableOpacity>
        </View>

        {/* Featured Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Products</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Marketplace" as never)}
            >
              <Text style={styles.sectionLink}>See All</Text>
            </TouchableOpacity>
          </View>

          {featuredProducts.length > 0 ? (
            <FlatList
              data={featuredProducts}
              renderItem={renderProduct}
              keyExtractor={(item) => item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="cube-outline" size={48} color="#9CA3AF" />
              <Text style={styles.emptyStateText}>
                No featured products yet
              </Text>
            </View>
          )}
        </View>

        {/* Popular Shops */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Shops</Text>
            <TouchableOpacity>
              <Text style={styles.sectionLink}>See All</Text>
            </TouchableOpacity>
          </View>

          {popularShops.length > 0 ? (
            <FlatList
              data={popularShops}
              renderItem={renderShop}
              keyExtractor={(item) => item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="storefront-outline" size={48} color="#9CA3AF" />
              <Text style={styles.emptyStateText}>No shops available</Text>
            </View>
          )}
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shop by Category</Text>
          <View style={styles.categoriesGrid}>
            <TouchableOpacity style={styles.categoryCard}>
              <Text style={styles.categoryIcon}>👗</Text>
              <Text style={styles.categoryName}>Fashion</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.categoryCard}>
              <Text style={styles.categoryIcon}>📱</Text>
              <Text style={styles.categoryName}>Electronics</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.categoryCard}>
              <Text style={styles.categoryIcon}>🏠</Text>
              <Text style={styles.categoryName}>Home</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.categoryCard}>
              <Text style={styles.categoryIcon}>💄</Text>
              <Text style={styles.categoryName}>Beauty</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  greeting: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  subGreeting: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  cartButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchPlaceholder: {
    fontSize: 16,
    color: "#9CA3AF",
    marginLeft: 12,
  },
  quickActions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    justifyContent: "space-between",
    marginBottom: 24,
  },
  quickAction: {
    alignItems: "center",
    flex: 1,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: "#374151",
    textAlign: "center",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  sectionLink: {
    fontSize: 14,
    color: "#10B981",
    fontWeight: "500",
  },
  horizontalList: {
    paddingHorizontal: 20,
  },
  productCard: {
    width: 160,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  productImage: {
    width: "100%",
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  productInfo: {
    padding: 12,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1F2937",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#10B981",
    marginBottom: 8,
  },
  shopInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  shopName: {
    fontSize: 12,
    color: "#6B7280",
    flex: 1,
  },
  shopCard: {
    width: 140,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginRight: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  shopLogo: {
    marginBottom: 12,
  },
  shopLogoImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  shopLogoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
  },
  shopLogoText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  shopCardInfo: {
    alignItems: "center",
  },
  shopNameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  shopCardName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1F2937",
    marginRight: 4,
  },
  shopProductCount: {
    fontSize: 12,
    color: "#6B7280",
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryCard: {
    width: (width - 56) / 2,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 8,
  },
});




