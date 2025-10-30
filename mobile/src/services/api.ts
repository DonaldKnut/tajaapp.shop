import axios, { AxiosResponse } from "axios";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

// Get API URL from config
const API_URL =
  Constants.expoConfig?.extra?.apiUrl || "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, redirect to login
      await SecureStore.deleteItemAsync("token");
      await SecureStore.deleteItemAsync("user");
      // You might want to trigger a logout event here
    }
    return Promise.reject(error);
  }
);

// API Response type
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Auth API
export const authAPI = {
  login: async (email: string, password: string): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.post("/auth/login", {
      email,
      password,
    });
    return response.data;
  },

  register: async (userData: {
    fullName: string;
    email: string;
    password: string;
    phone: string;
    role: "buyer" | "seller";
  }): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.post(
      "/auth/register",
      userData
    );
    return response.data;
  },

  getProfile: async (): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.get("/auth/profile");
    return response.data;
  },

  updateProfile: async (userData: any): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.put(
      "/auth/profile",
      userData
    );
    return response.data;
  },

  changePassword: async (
    currentPassword: string,
    newPassword: string
  ): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.put(
      "/auth/change-password",
      {
        currentPassword,
        newPassword,
      }
    );
    return response.data;
  },
};

// Products API
export const productsAPI = {
  getProducts: async (params?: any): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.get("/products", {
      params,
    });
    return response.data;
  },

  getProduct: async (id: string): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.get(
      `/products/${id}`
    );
    return response.data;
  },

  getFeaturedProducts: async (): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.get(
      "/products/featured"
    );
    return response.data;
  },

  searchProducts: async (
    query: string,
    filters?: any
  ): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.get("/products", {
      params: { search: query, ...filters },
    });
    return response.data;
  },
};

// Shops API
export const shopsAPI = {
  getShops: async (): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.get("/shops");
    return response.data;
  },

  getShop: async (slug: string): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.get(
      `/shops/${slug}`
    );
    return response.data;
  },

  createShop: async (shopData: any): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.post(
      "/shops",
      shopData
    );
    return response.data;
  },

  updateShop: async (shopId: string, shopData: any): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.put(
      `/shops/${shopId}`,
      shopData
    );
    return response.data;
  },
};

// Orders API
export const ordersAPI = {
  getOrders: async (): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.get("/orders");
    return response.data;
  },

  getOrder: async (id: string): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.get(`/orders/${id}`);
    return response.data;
  },

  createOrder: async (orderData: any): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.post(
      "/orders",
      orderData
    );
    return response.data;
  },

  updateOrderStatus: async (
    id: string,
    status: string
  ): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.put(
      `/orders/${id}/status`,
      { status }
    );
    return response.data;
  },
};

// Chat API
export const chatAPI = {
  getChats: async (): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.get("/chat");
    return response.data;
  },

  getChat: async (id: string): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.get(`/chat/${id}`);
    return response.data;
  },

  startChat: async (
    otherUserId: string,
    productId?: string,
    shopId?: string
  ): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.post("/chat/start", {
      otherUserId,
      productId,
      shopId,
    });
    return response.data;
  },

  sendMessage: async (
    chatId: string,
    content: string,
    type = "text"
  ): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.post(
      `/chat/${chatId}/messages`,
      {
        content,
        type,
      }
    );
    return response.data;
  },

  markAsRead: async (chatId: string): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.put(
      `/chat/${chatId}/read`
    );
    return response.data;
  },
};

// Payments API
export const paymentsAPI = {
  initializePayment: async (
    orderId: string,
    amount: number
  ): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.post(
      "/payments/initialize",
      {
        orderId,
        amount,
      }
    );
    return response.data;
  },

  verifyPayment: async (reference: string): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.get(
      `/payments/verify/${reference}`
    );
    return response.data;
  },
};

// Upload API
export const uploadAPI = {
  uploadImage: async (formData: FormData): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.post(
      "/upload/image",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  uploadImages: async (formData: FormData): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.post(
      "/upload/images",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },
};

export default api;




