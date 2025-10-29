import mongoose from "mongoose";
import { Category } from "../models/Category";
import dotenv from "dotenv";

dotenv.config();

const categories = [
  // Fashion & Beauty
  {
    name: "Fashion & Beauty",
    slug: "fashion-beauty",
    description: "Clothing, accessories, and beauty products",
    icon: "👗",
    sortOrder: 1,
    subcategories: [
      {
        name: "Women's Clothing",
        slug: "womens-clothing",
        description: "Dresses, tops, bottoms, and outerwear for women",
        icon: "👚",
        sortOrder: 1,
      },
      {
        name: "Men's Clothing",
        slug: "mens-clothing",
        description: "Shirts, pants, suits, and casual wear for men",
        icon: "👔",
        sortOrder: 2,
      },
      {
        name: "Shoes & Bags",
        slug: "shoes-bags",
        description: "Footwear, handbags, and accessories",
        icon: "👠",
        sortOrder: 3,
      },
      {
        name: "Jewelry & Watches",
        slug: "jewelry-watches",
        description: "Necklaces, rings, watches, and accessories",
        icon: "💍",
        sortOrder: 4,
      },
      {
        name: "Beauty & Cosmetics",
        slug: "beauty-cosmetics",
        description: "Makeup, skincare, hair care, and fragrances",
        icon: "💄",
        sortOrder: 5,
      },
      {
        name: "Thrift & Vintage",
        slug: "thrift-vintage",
        description: "Pre-loved and vintage fashion items",
        icon: "🕰️",
        sortOrder: 6,
      },
    ],
  },
  // Electronics & Technology
  {
    name: "Electronics & Technology",
    slug: "electronics-technology",
    description: "Electronic devices, gadgets, and tech accessories",
    icon: "📱",
    sortOrder: 2,
    subcategories: [
      {
        name: "Phones & Tablets",
        slug: "phones-tablets",
        description: "Smartphones, tablets, and accessories",
        icon: "📱",
        sortOrder: 1,
      },
      {
        name: "Computers & Laptops",
        slug: "computers-laptops",
        description: "Laptops, desktops, and computer accessories",
        icon: "💻",
        sortOrder: 2,
      },
      {
        name: "Audio & Video",
        slug: "audio-video",
        description: "Headphones, speakers, cameras, and video equipment",
        icon: "🎧",
        sortOrder: 3,
      },
      {
        name: "Gaming",
        slug: "gaming",
        description: "Gaming consoles, games, and accessories",
        icon: "🎮",
        sortOrder: 4,
      },
      {
        name: "Home Appliances",
        slug: "home-appliances",
        description: "Kitchen appliances, home electronics, and gadgets",
        icon: "🏠",
        sortOrder: 5,
      },
    ],
  },
  // Home & Garden
  {
    name: "Home & Garden",
    slug: "home-garden",
    description: "Furniture, decor, and garden items",
    icon: "🏡",
    sortOrder: 3,
    subcategories: [
      {
        name: "Furniture",
        slug: "furniture",
        description: "Sofas, chairs, tables, and storage furniture",
        icon: "🪑",
        sortOrder: 1,
      },
      {
        name: "Home Decor",
        slug: "home-decor",
        description: "Wall art, decorative items, and lighting",
        icon: "🖼️",
        sortOrder: 2,
      },
      {
        name: "Kitchen & Dining",
        slug: "kitchen-dining",
        description: "Cookware, dinnerware, and kitchen accessories",
        icon: "🍽️",
        sortOrder: 3,
      },
      {
        name: "Bedding & Bath",
        slug: "bedding-bath",
        description: "Bed linens, towels, and bathroom accessories",
        icon: "🛏️",
        sortOrder: 4,
      },
      {
        name: "Garden & Outdoor",
        slug: "garden-outdoor",
        description: "Plants, garden tools, and outdoor furniture",
        icon: "🌱",
        sortOrder: 5,
      },
    ],
  },
  // Automotive
  {
    name: "Automotive",
    slug: "automotive",
    description: "Cars, motorcycles, and automotive accessories",
    icon: "🚗",
    sortOrder: 4,
    subcategories: [
      {
        name: "Cars",
        slug: "cars",
        description: "Used and new cars for sale",
        icon: "🚗",
        sortOrder: 1,
      },
      {
        name: "Motorcycles & Bikes",
        slug: "motorcycles-bikes",
        description: "Motorcycles, bicycles, and related accessories",
        icon: "🏍️",
        sortOrder: 2,
      },
      {
        name: "Auto Parts & Accessories",
        slug: "auto-parts-accessories",
        description: "Car parts, tools, and automotive accessories",
        icon: "🔧",
        sortOrder: 3,
      },
    ],
  },
  // Sports & Recreation
  {
    name: "Sports & Recreation",
    slug: "sports-recreation",
    description: "Sports equipment, fitness gear, and recreational items",
    icon: "⚽",
    sortOrder: 5,
    subcategories: [
      {
        name: "Fitness & Exercise",
        slug: "fitness-exercise",
        description: "Gym equipment, fitness accessories, and workout gear",
        icon: "💪",
        sortOrder: 1,
      },
      {
        name: "Outdoor Sports",
        slug: "outdoor-sports",
        description:
          "Football, basketball, tennis, and outdoor sports equipment",
        icon: "⚽",
        sortOrder: 2,
      },
      {
        name: "Water Sports",
        slug: "water-sports",
        description: "Swimming, diving, and water activity equipment",
        icon: "🏊",
        sortOrder: 3,
      },
    ],
  },
  // Books & Media
  {
    name: "Books & Media",
    slug: "books-media",
    description: "Books, magazines, movies, and educational materials",
    icon: "📚",
    sortOrder: 6,
    subcategories: [
      {
        name: "Books",
        slug: "books",
        description: "Fiction, non-fiction, textbooks, and educational books",
        icon: "📖",
        sortOrder: 1,
      },
      {
        name: "Movies & Music",
        slug: "movies-music",
        description: "DVDs, CDs, vinyl records, and digital media",
        icon: "🎬",
        sortOrder: 2,
      },
      {
        name: "Educational Materials",
        slug: "educational-materials",
        description: "Study guides, courses, and learning resources",
        icon: "🎓",
        sortOrder: 3,
      },
    ],
  },
  // Baby & Kids
  {
    name: "Baby & Kids",
    slug: "baby-kids",
    description: "Baby products, children's items, and toys",
    icon: "👶",
    sortOrder: 7,
    subcategories: [
      {
        name: "Baby Clothing",
        slug: "baby-clothing",
        description: "Clothes for babies and toddlers",
        icon: "👶",
        sortOrder: 1,
      },
      {
        name: "Toys & Games",
        slug: "toys-games",
        description: "Educational toys, games, and play equipment",
        icon: "🧸",
        sortOrder: 2,
      },
      {
        name: "Baby Gear",
        slug: "baby-gear",
        description: "Strollers, car seats, and baby equipment",
        icon: "🚼",
        sortOrder: 3,
      },
    ],
  },
  // Health & Wellness
  {
    name: "Health & Wellness",
    slug: "health-wellness",
    description: "Health products, supplements, and wellness items",
    icon: "💊",
    sortOrder: 8,
    subcategories: [
      {
        name: "Supplements",
        slug: "supplements",
        description: "Vitamins, protein powders, and health supplements",
        icon: "💊",
        sortOrder: 1,
      },
      {
        name: "Medical Equipment",
        slug: "medical-equipment",
        description: "Health monitoring devices and medical supplies",
        icon: "🩺",
        sortOrder: 2,
      },
      {
        name: "Personal Care",
        slug: "personal-care",
        description: "Hygiene products and personal wellness items",
        icon: "🧴",
        sortOrder: 3,
      },
    ],
  },
  // Art & Crafts
  {
    name: "Art & Crafts",
    slug: "art-crafts",
    description: "Handmade items, artwork, and craft supplies",
    icon: "🎨",
    sortOrder: 9,
    subcategories: [
      {
        name: "Handmade Items",
        slug: "handmade-items",
        description: "Handcrafted jewelry, decor, and unique items",
        icon: "✋",
        sortOrder: 1,
      },
      {
        name: "Art Supplies",
        slug: "art-supplies",
        description: "Paints, brushes, canvases, and craft materials",
        icon: "🎨",
        sortOrder: 2,
      },
      {
        name: "Artwork",
        slug: "artwork",
        description: "Paintings, drawings, and artistic creations",
        icon: "🖼️",
        sortOrder: 3,
      },
    ],
  },
  // Other
  {
    name: "Other",
    slug: "other",
    description: "Miscellaneous items that don't fit other categories",
    icon: "📦",
    sortOrder: 10,
    subcategories: [
      {
        name: "Collectibles",
        slug: "collectibles",
        description: "Antiques, collectible items, and rare finds",
        icon: "🏺",
        sortOrder: 1,
      },
      {
        name: "Tools & Equipment",
        slug: "tools-equipment",
        description: "Professional tools and equipment",
        icon: "🔨",
        sortOrder: 2,
      },
      {
        name: "Miscellaneous",
        slug: "miscellaneous",
        description: "Other items not categorized elsewhere",
        icon: "📦",
        sortOrder: 3,
      },
    ],
  },
];

async function seedCategories() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/taja-shop"
    );

    console.log("Connected to MongoDB");

    // Clear existing categories
    await Category.deleteMany({});
    console.log("Cleared existing categories");

    // Create main categories and their subcategories
    for (const categoryData of categories) {
      const { subcategories, ...mainCategoryData } = categoryData;

      // Create main category
      const mainCategory = new Category(mainCategoryData);
      await mainCategory.save();
      console.log(`Created main category: ${mainCategory.name}`);

      // Create subcategories
      for (const subcategoryData of subcategories) {
        const subcategory = new Category({
          ...subcategoryData,
          parent: mainCategory._id,
        });
        await subcategory.save();
        console.log(`  Created subcategory: ${subcategory.name}`);
      }
    }

    console.log("Categories seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding categories:", error);
    process.exit(1);
  }
}

// Run the seeder
if (require.main === module) {
  seedCategories();
}

export { seedCategories };

