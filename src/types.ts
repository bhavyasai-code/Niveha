/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  category: "Earrings" | "Jewellery" | "Handbags" | "Tote Bags" | "Shoes" | "Sandals" | "Women's Fashion" | "Men's Fashion" | "Phone Cases";
  price: number;
  originalPrice: number;
  rating: number;
  reviewsCount: number;
  image: string;
  tryOnImage?: string; // High-res crop of the item matching overlays
  tryOnType?: "earrings" | "necklace" | "dress";
  description: string;
  isNewArrival?: boolean;
  isKalamkari?: boolean;
  sizes?: string[];
  colors?: string[];
  material?: string;
  gender?: "Men" | "Women" | "Unisex";
  inventory: number;
}

export interface Review {
  id: string;
  name: string;
  location: string;
  rating: number;
  comment: string;
  date: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface Feedback {
  id: string;
  productQuality: number;
  packaging: number;
  delivery: number;
  websiteExperience: number;
  suggestions: string;
  timestamp: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  totalAmount: number;
  discountAmount: number;
  address: {
    name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  paymentMethod: string;
  status: "Pending" | "Dispatched" | "Out for Delivery" | "Delivered";
  estimatedDelivery: string;
  trackingNumber: string;
  timestamp: string;
}

export type ActiveTab = "home" | "shop" | "kalamkari" | "dashboard" | "admin";
