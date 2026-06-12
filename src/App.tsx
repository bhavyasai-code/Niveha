/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  ShoppingBag,
  Heart,
  Search,
  SlidersHorizontal,
  ChevronRight,
  Star,
  MapPin,
  Clock,
  Phone,
  Mail,
  Truck,
  ShieldCheck,
  Percent,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  Award,
  ChevronLeft,
  X,
  User,
  Settings,
  Menu,
  Sparkles,
  Info,
  Calendar,
  ThumbsUp,
  DollarSign,
  Package,
  Layers,
  FileText,
  Camera,
  ZoomIn,
  ZoomOut,
  Upload
} from "lucide-react";

import { Product, CartItem, Order, Feedback, Review, ActiveTab } from "./types";
import { productsData, reviewsData } from "./data/products";
import VirtualTryOn from "./components/VirtualTryOn";
import NiviChatbot from "./components/NiviChatbot";

export default function App() {
  // Page Navigation State
  const [activeTab, setActiveTab] = useState<ActiveTab>("home");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Shop Smart Search & Filtering States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedGender, setSelectedGender] = useState<string>("All");
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [selectedMaterial, setSelectedMaterial] = useState<string>("All");
  const [minRating, setMinRating] = useState<number>(0);
  const [searchPlaceholderMsg, setSearchPlaceholderMsg] = useState("");

  // Cart & Wishlist States
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [savedForLater, setSavedForLater] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [activeDiscount, setActiveDiscount] = useState<{ code: string; percent: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  // Checkout Form States
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutName, setCheckoutName] = useState("");
  const [checkoutPhone, setCheckoutPhone] = useState("");
  const [checkoutStreet, setCheckoutStreet] = useState("MVP Colony, Near Beach Road");
  const [checkoutCity, setCheckoutCity] = useState("Visakhapatnam");
  const [checkoutState, setCheckoutState] = useState("Andhra Pradesh");
  const [checkoutPincode, setCheckoutPincode] = useState("530017");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [selectedUpi, setSelectedUpi] = useState("Google Pay");
  const [orderComplete, setOrderComplete] = useState<Order | null>(null);

  // Post-purchase feedback states
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [rateQuality, setRateQuality] = useState(5);
  const [ratePackaging, setRatePackaging] = useState(5);
  const [rateDelivery, setRateDelivery] = useState(5);
  const [rateWeb, setRateWeb] = useState(5);
  const [suggestions, setSuggestions] = useState("");

  // List Databases
  const [products, setProducts] = useState<Product[]>(productsData);
  const [orders, setOrders] = useState<Order[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [reviews, setReviews] = useState<Review[]>(reviewsData);

  // Active review testimonial slider state
  const [activeReviewIdx, setActiveReviewIdx] = useState(0);

  // Try-on panel triggers
  const [showTryOnModal, setShowTryOnModal] = useState(false);
  const [activeTryOnItem, setActiveTryOnItem] = useState<Product | null>(null);

  // Zoom scale for product detail preview
  const [detailZoom, setDetailZoom] = useState(1);

  // Sync state with database on initial load
  useEffect(() => {
    fetchProducts();
    fetchOrdersAndFeedback();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data && data.length) setProducts(data);
    } catch (e) {
      console.warn("Could not fetch remote products database. Relying on default dataset.", e);
    }
  };

  const fetchOrdersAndFeedback = async () => {
    try {
      const ordersRes = await fetch("/api/orders");
      const ordersData = await ordersRes.json();
      setOrders(ordersData);

      const fbRes = await fetch("/api/feedback");
      const fbData = await fbRes.json();
      setFeedbacks(fbData);
    } catch (e) {
      console.warn("Using offline state cache for user submissions.", e);
    }
  };

  // Smart Search parser engine ("Red Kalamkari bag under ₹1500", "Traditional earrings", "Women's sandals")
  const parseSmartSearchAndApply = (query: string) => {
    setSearchQuery(query);
    const lower = query.toLowerCase();

    // Reset default filters
    setSelectedCategory("All");
    setSelectedGender("All");
    setMaxPrice(5000);
    setSelectedMaterial("All");

    // Apply specific heuristics
    if (lower.includes("under") || lower.includes("below") || lower.includes("₹")) {
      const match = lower.match(/(under|below|₹)\s*(\d+)/i);
      if (match && match[2]) {
        setMaxPrice(parseInt(match[2]));
      }
    }

    if (lower.includes("kalamkari") || lower.includes("handbag") || lower.includes("bag")) {
      setSelectedCategory("Handbags");
      if (lower.includes("tote")) {
        setSelectedCategory("Tote Bags");
      }
    } else if (lower.includes("earring") || lower.includes("jhumka")) {
      setSelectedCategory("Earrings");
    } else if (lower.includes("jewel") || lower.includes("necklace") || lower.includes("choker")) {
      setSelectedCategory("Jewellery");
    } else if (lower.includes("sandal") || lower.includes("chappal")) {
      setSelectedCategory("Sandals");
    } else if (lower.includes("shoe") || lower.includes("mojri") || lower.includes("jutti")) {
      setSelectedCategory("Shoes");
    }

    if (lower.includes("women") || lower.includes("girl") || lower.includes("female")) {
      setSelectedGender("Women");
    } else if (lower.includes("men") || lower.includes("boy") || lower.includes("male")) {
      setSelectedGender("Men");
    }
  };

  // Cart operations
  const addToCart = (product: Product, size?: string, color?: string) => {
    setCart((prev) => {
      const existing = prev.find(
        (item) =>
          item.product.id === product.id &&
          item.selectedSize === size &&
          item.selectedColor === color
      );
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id &&
          item.selectedSize === size &&
          item.selectedColor === color
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1, selectedSize: size, selectedColor: color }];
    });
    // Visual alert
    setSearchPlaceholderMsg(`Added ${product.name} seamlessly inside your shopping bag!`);
    setTimeout(() => setSearchPlaceholderMsg(""), 3000);
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const updateQuantity = (index: number, delta: number) => {
    setCart((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          const qty = item.quantity + delta;
          return { ...item, quantity: qty < 1 ? 1 : qty };
        }
        return item;
      })
    );
  };

  const saveForLaterItem = (index: number) => {
    const item = cart[index];
    setSavedForLater((prev) => [...prev, item]);
    removeFromCart(index);
  };

  const moveToCartFromLater = (index: number) => {
    const item = savedForLater[index];
    setCart((prev) => [...prev, item]);
    setSavedForLater((prev) => prev.filter((_, i) => i !== index));
  };

  // Wishlist actions
  const toggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.find((p) => p.id === product.id);
      if (exists) return prev.filter((p) => p.id !== product.id);
      return [...prev, product];
    });
  };

  // Apply Coupon Codes
  const applyCoupon = () => {
    setCouponError(null);
    setCouponSuccess(null);
    const code = couponCode.trim().toUpperCase();

    if (code === "NIVEHA10") {
      setActiveDiscount({ code: "NIVEHA10", percent: 10 });
      setCouponSuccess("Congratulations! NIVEHA10 has been applied for 10% discount on entire cart.");
    } else if (code === "WELCOME20") {
      setActiveDiscount({ code: "WELCOME20", percent: 20 });
      setCouponSuccess("Marvelous! WELCOME20 applied, giving you 20% discount on handcrafted designs.");
    } else if (code === "FESTIVE25") {
      setActiveDiscount({ code: "FESTIVE25", percent: 25 });
      setCouponSuccess("Bespoke luxury celebration! FESTIVE25 code has sliced 25% off checkout value.");
    } else {
      setCouponError("Invalid coupon code. Try 'NIVEHA10', 'WELCOME20', or 'FESTIVE25' for authentic discounts.");
    }
  };

  // Cart financial summary
  const getSubtotal = () => cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const getDiscount = () => {
    if (!activeDiscount) return 0;
    return Math.round((getSubtotal() * activeDiscount.percent) / 100);
  };
  const getFinalTotal = () => getSubtotal() - getDiscount();

  // Create new order
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutName.trim() || !checkoutPhone.trim()) {
      alert("Please provide custom billing name and phone contact info.");
      return;
    }

    const estimateDeliveryDays = 4;
    const date = new Date();
    date.setDate(date.getDate() + estimateDeliveryDays);

    const deliveryPartners = ["Delhivery", "DTDC", "Blue Dart", "Ecom Express", "India Post"];
    const chosenPartner = deliveryPartners[Math.floor(Math.random() * deliveryPartners.length)];

    const simulatedOrderData: Order = {
      id: "", // Server will provide ID or we create fallback
      items: [...cart],
      totalAmount: getFinalTotal(),
      discountAmount: getDiscount(),
      address: {
        name: checkoutName,
        phone: checkoutPhone,
        street: checkoutStreet,
        city: checkoutCity,
        state: checkoutState,
        pincode: checkoutPincode,
      },
      paymentMethod: `${paymentMethod}${paymentMethod === "UPI" ? ` - ${selectedUpi}` : ""}`,
      status: "Pending",
      estimatedDelivery: date.toLocaleDateString("en-IN", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      trackingNumber: `NIV-${chosenPartner.substring(0, 3).toUpperCase()}-${Math.floor(10000000 + Math.random() * 90000000)}`,
      timestamp: new Date().toISOString(),
    };

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: simulatedOrderData }),
      });
      const resData = await response.json();
      if (resData.success) {
        setOrderComplete(resData.order);
        setOrders((prev) => [...prev, resData.order]);
      } else {
        throw new Error();
      }
    } catch {
      // Offline fallback state management
      const fallbackOrder = {
        ...simulatedOrderData,
        id: `NIV-${Math.floor(100000 + Math.random() * 900000)}`,
      };
      setOrderComplete(fallbackOrder);
      setOrders((prev) => [...prev, fallbackOrder]);
    }

    // Reset shopping cart state
    setCart([]);
    setIsCheckingOut(false);
    setActiveDiscount(null);
    setCouponCode("");
  };

  // Save Customer order feedback ratings
  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    const mockFeedbackData: Feedback = {
      id: "",
      productQuality: rateQuality,
      packaging: ratePackaging,
      delivery: rateDelivery,
      websiteExperience: rateWeb,
      suggestions,
      timestamp: new Date().toISOString(),
    };

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback: mockFeedbackData }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedbacks((prev) => [...prev, data.feedback]);
      }
    } catch {
      setFeedbacks((prev) => [
        ...prev,
        { ...mockFeedbackData, id: `FB-${Math.floor(1000 + Math.random() * 9000)}` },
      ]);
    }

    setFeedbackSubmitted(true);
    setTimeout(() => {
      setFeedbackSubmitted(false);
      setOrderComplete(null); // Close order screen
    }, 4000);
  };

  // Launch Live Interactive Virtual Try On
  const triggerLiveTryOn = (product: Product) => {
    setActiveTryOnItem(product);
    setShowTryOnModal(true);
  };

  // Filtered Products listing computed properties
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    const matchesGender = selectedGender === "All" || p.gender === selectedGender || p.gender === "Unisex";
    const matchesPrice = p.price <= maxPrice;
    const matchesMaterial =
      selectedMaterial === "All" || (p.material && p.material.includes(selectedMaterial));
    const matchesRating = p.rating >= minRating;

    return matchesSearch && matchesCategory && matchesGender && matchesPrice && matchesMaterial && matchesRating;
  });

  return (
    <div className="min-h-screen bg-[#FFF9F4] text-[#3c305a] font-sans antialiased selection:bg-[#D8C8F0] selection:text-[#4b3c63]">
      
      {/* 1. Global top aesthetic announcement bar */}
      <div className="bg-[#D8C8F0] text-[#4b3c63] text-center py-2 px-4 text-xs font-semibold tracking-wider flex items-center justify-between shadow-xs">
        <div className="flex gap-4 items-center">
          <span className="flex items-center gap-1">✨ Authentic Andhra Kalamkari Artistry</span>
          <span className="hidden md:inline-flex items-center gap-1">• 🚚 Free Express Courier Across India</span>
        </div>
        <div className="text-[11px] font-bold">
          Call/WhatsApp: +91 98765 43210
        </div>
      </div>

      {/* 2. Brand Luxury Floral Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#D8C8F0]/30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Symmetrical Minimalist logo design combining Leter N - Floral elegance - curves */}
          <div
            onClick={() => {
              setActiveTab("home");
              setSelectedProduct(null);
            }}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <div className="w-11 h-11 bg-gradient-to-tr from-[#D8C8F0] via-[#F8D7DA] to-[#FFD6C2] rounded-full flex items-center justify-center shadow-inner border border-[#FFF9F4]/40 shrink-0">
              <svg viewBox="0 0 100 100" className="w-7 h-7 text-[#4b3c63]">
                {/* Minimalist modern N paired with floral petals and handbag loop curves */}
                <path
                  d="M25 75V25C25 25 35 30 50 25C65 20 75 25 75 25V75"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M25 75C35 45 65 55 75 25"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                {/* Floral elegant curves and handbag motif arch */}
                <path
                  d="M35 25C35 15 65 15 65 25"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray="4 2"
                />
                <circle cx="50" cy="50" r="10" fill="#FFF9F4" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-serif tracking-widest font-bold text-[#3c305a] leading-none">NIVEHA</h1>
              <span className="text-[9px] uppercase tracking-widest text-pink-700 block mt-1 font-semibold">
                Style Crafted For Every You.
              </span>
            </div>
          </div>

          {/* Interactive Responsive Menu Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs uppercase font-bold tracking-wider text-gray-600">
            <button
              onClick={() => {
                setActiveTab("home");
                setSelectedProduct(null);
              }}
              className={`py-2 transition-all hover:text-[#4b3c63] ${
                activeTab === "home" ? "border-b-2 border-[#4b3c63] text-[#4b3c63]" : ""
              }`}
            >
              Home
            </button>
            <button
              onClick={() => {
                setActiveTab("shop");
                setSelectedProduct(null);
              }}
              className={`py-2 transition-all hover:text-[#4b3c63] ${
                activeTab === "shop" ? "border-b-2 border-[#4b3c63] text-[#4b3c63]" : ""
              }`}
            >
              Shop Collection
            </button>
            <button
              onClick={() => {
                setActiveTab("kalamkari");
                setSelectedProduct(null);
              }}
              className={`py-2 transition-all hover:text-[#4b3c63] ${
                activeTab === "kalamkari" ? "border-b-2 border-[#4b3c63] text-[#4b3c63]" : ""
              }`}
            >
              Kalamkari Heritage
            </button>
            <button
              onClick={() => {
                setActiveTab("dashboard");
                setSelectedProduct(null);
              }}
              className={`py-2 transition-all hover:text-[#4b3c63] ${
                activeTab === "dashboard" ? "border-b-2 border-[#4b3c63] text-[#4b3c63]" : ""
              }`}
            >
              My Dashboard
            </button>
            <button
              onClick={() => {
                setActiveTab("admin");
                setSelectedProduct(null);
              }}
              className={`py-2 transition-all text-amber-900 border border-amber-300 bg-amber-50 rounded-md px-2 py-1 flex items-center gap-1 hover:bg-[#DDE8D5] ${
                activeTab === "admin" ? "bg-[#DDE8D5] font-bold" : ""
              }`}
            >
              <Settings className="w-3.5 h-3.5 shrink-0" /> Studio Admin
            </button>
          </nav>

          {/* Cart, Wishlist, Search indicators layout block */}
          <div className="flex items-center gap-3 md:gap-5">
            {/* Quick Micro Indicator */}
            {searchPlaceholderMsg && (
              <span className="hidden md:inline bg-[#DDE8D5] text-[#2c4021] text-[10px] px-3 py-1 rounded-full border border-emerald-300 font-medium animate-bounce">
                {searchPlaceholderMsg}
              </span>
            )}

            {/* Wishlist Icon link */}
            <button
              onClick={() => {
                setActiveTab("dashboard");
                setSelectedProduct(null);
              }}
              className="relative p-2.5 rounded-full hover:bg-gray-100 transition-all text-gray-600 hover:text-red-500"
              title="View Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Icon trigger toggle overlay */}
            <button
              onClick={() => {
                setIsCheckingOut(false);
                setActiveTab("home");
                // Open shopping basket container below
                const element = document.getElementById("cart-slide-panel");
                if (element) {
                  element.scrollIntoView({ behavior: "smooth" });
                } else {
                  alert(`You currently have ${cart.length} authentic handcrafts inside your checkout queue.`);
                }
              }}
              className="relative bg-gradient-to-b from-white to-gray-50 border p-3 rounded-full hover:border-[#D8C8F0] text-[#4b3c63] shadow-xs flex items-center justify-center transition-all duration-300 hover:scale-105"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-1.5 -right-1.5 bg-[#4b3c63] text-[#FFF9F4] text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-extrabold border border-white">
                {cart.reduce((s, c) => s + c.quantity, 0)}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* 3. Main Dashboard Wrapper */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">

        {/* ==================== HOME PAGE VIEW ==================== */}
        {activeTab === "home" && !selectedProduct && (
          <div className="space-y-16 animate-fade-in">
            
            {/* Elegant Hero Slider Banner */}
            <div className="relative rounded-[40px] bg-gradient-to-r from-white via-[#FFF9F4] to-[#FFF9F4] p-8 md:p-16 border border-[#D8C8F0]/30 shadow-md overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Background elegant circles */}
              <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#D8C8F0]/15 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-40 -right-20 w-80 h-80 bg-[#FFD6C2]/20 rounded-full blur-3xl pointer-events-none"></div>

              {/* Text Side (7 Columns) */}
              <div className="lg:col-span-7 space-y-6 relative z-10 text-center lg:text-left">
                <span className="inline-flex items-center gap-1.5 bg-[#FFF9F4] text-pink-700 text-xs font-bold px-3 py-1.5 rounded-full shadow-inner border border-[#F8D7DA] uppercase tracking-wider">
                  🌸 Andhra Pradesh Heritage Spotlight
                </span>
                <h2 className="text-4xl md:text-6xl font-serif text-[#3c305a] leading-[1.1] tracking-tight">
                  Where Srikalahasti <br />
                  <span className="italic font-normal text-pink-800">Meets Modern Chic.</span>
                </h2>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed max-w-xl">
                  Discover Niveha’s signature **Kalamkari Handbags** - beautiful, hand-drawn vegetable-dyed cotton canvas motifs styled seamlessly into luxurious current-day leather totes, clutches, and accessories. Experience local artistry crafted carefully for you.
                </p>

                {/* Call to Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                  <button
                    onClick={() => {
                      setActiveTab("shop");
                      setSelectedCategory("All");
                    }}
                    className="w-full sm:w-auto bg-[#4b3c63] hover:bg-[#34284b] text-white text-xs font-bold uppercase tracking-wider px-8 py-4 rounded-full transition-all duration-300 shadow-md hover:translate-y-[-2px] cursor-pointer"
                  >
                    Shop Entire studio
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("kalamkari");
                    }}
                    className="w-full sm:w-auto bg-white border-2 border-[#D8C8F0] hover:bg-[#FFF9F4] text-[#4b3c63] text-xs font-bold uppercase tracking-wider px-6 py-4 rounded-full transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Kalamkari Heritage story <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("shop");
                      setSelectedCategory("All");
                      setSearchQuery("");
                      // Select new arrival filters
                      const el = document.getElementById("p_list_grid");
                      if(el) el.scrollIntoView({behavior: "smooth"});
                    }}
                    className="w-full sm:w-auto text-[#4b3c63] text-xs font-bold underline hover:text-[#3c305a]"
                  >
                    New Arrivals
                  </button>
                </div>

                {/* Key USP Flags */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#D8C8F0]/30 text-left">
                  <div>
                    <h5 className="font-serif text-lg font-bold text-[#3c305a]">100%</h5>
                    <p className="text-[10px] uppercase tracking-wider text-gray-500">Natural Dyes</p>
                  </div>
                  <div>
                    <h5 className="font-serif text-lg font-bold text-[#3c305a]">₹0</h5>
                    <p className="text-[10px] uppercase tracking-wider text-gray-500">Shipping India</p>
                  </div>
                  <div>
                    <h5 className="font-serif text-lg font-bold text-[#3c305a]">Live</h5>
                    <p className="text-[10px] uppercase tracking-wider text-gray-500">Virtual Fitting</p>
                  </div>
                </div>
              </div>

              {/* Graphical Display Side (5 Columns) */}
              <div className="lg:col-span-5 relative flex justify-center">
                <div className="relative w-80 h-96 rounded-[30px] overflow-hidden border-8 border-white shadow-2xl skew-y-1 hover:skew-y-0 transition-all duration-500">
                  <img
                    src="https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800"
                    alt="Kalamkari Handbag Landmark"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent flex flex-col justify-end p-6 text-white text-left">
                    <span className="text-[10px] bg-amber-500 text-black font-extrabold px-2 py-0.5 rounded-full w-max">
                      SIGNATURE MASTERPIECE
                    </span>
                    <h4 className="font-serif text-xl mt-1.5">Heritage Srikalahasti Royal Tote</h4>
                    <p className="text-xs text-gray-300 mt-0.5">₹1,899 • Handcrafted with Organic Cotton Line</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Categories Carousel Section */}
            <div className="space-y-6">
              <div className="text-center">
                <span className="text-xs uppercase tracking-widest text-[#4b3c63]/80 font-bold">Curated for Elegance</span>
                <h3 className="text-3xl font-serif text-[#3c305a] mt-1">Explore Featured Categories</h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
                {[
                  { name: "Earrings", icon: "💎", image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=150" },
                  { name: "Handbags", icon: "👜", image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=150" },
                  { name: "Tote Bags", icon: "🛍️", image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=150" },
                  { name: "Shoes", icon: "👠", image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=150" },
                  { name: "Sandals", icon: "👡", image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=150" },
                  { name: "Women's Fashion", icon: "👗", image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=150" },
                  { name: "Jewellery", icon: "📿", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=150" },
                  { name: "Phone Cases", icon: "📱", image: "https://images.unsplash.com/photo-1580870013141-3b13c5100f1e?auto=format&fit=crop&q=80&w=150" },
                ].map((cat, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedCategory(cat.name);
                      setActiveTab("shop");
                    }}
                    className="bg-white hover:bg-[#FFF9F4] p-3 rounded-2xl border border-[#D8C8F0]/20 hover:border-[#D8C8F0] shadow-2xs hover:shadow-md transition-all text-center group cursor-pointer"
                  >
                    <div className="w-14 h-14 mx-auto rounded-full overflow-hidden border border-gray-100 group-hover:scale-110 transition-all text-2xl flex items-center justify-center bg-[#FFF9F4]">
                      {cat.icon}
                    </div>
                    <span className="text-xs font-bold text-[#3c305a] block mt-2.5 truncate group-hover:text-pink-700 transition-all">
                      {cat.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Trending Products Grid */}
            <div id="p_list_grid" className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-end gap-2 border-b pb-4 border-gray-100">
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#4b3c63]/80 font-bold">The Niveha Vault</span>
                  <h3 className="text-3xl font-serif text-[#3c305a] mt-1">Trending Masterworks</h3>
                </div>
                <div className="flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none py-1">
                  {["All", "Handbags", "Tote Bags", "Earrings", "Women's Fashion", "Phone Cases"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setActiveTab("shop");
                      }}
                      className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                        selectedCategory === cat
                          ? "bg-[#D8C8F0] text-[#4b3c63] border-[#4b3c63]"
                          : "bg-white text-gray-500 hover:text-[#4b3c63]"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Standard card layout mapping */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.slice(0, 8).map((p) => (
                  <div
                    key={p.id}
                    className="bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-[#D8C8F0]/60 shadow-2xs hover:shadow-lg transition-all flex flex-col group relative"
                  >
                    {/* Floating Wishlist Button */}
                    <button
                      onClick={() => toggleWishlist(p)}
                      className="absolute top-4 right-4 z-15 bg-white/70 backdrop-blur-xs p-2 rounded-full shadow-md text-gray-400 hover:text-red-500 transition-all"
                    >
                      <Heart
                        className={`w-4.5 h-4.5 ${
                          wishlist.find((item) => item.id === p.id) ? "fill-red-500 text-red-500" : ""
                        }`}
                      />
                    </button>

                    {/* Image Area with hover info */}
                    <div
                      className="relative aspect-square overflow-hidden cursor-pointer"
                      onClick={() => setSelectedProduct(p)}
                    >
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                        loading="lazy"
                      />
                      {p.isKalamkari && (
                        <div className="absolute top-4 left-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-full shadow-sm">
                          Pen Kalamkari AP
                        </div>
                      )}
                      
                      {/* Hover Live Try Overlay Option if supported */}
                      {p.tryOnType && (
                        <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-xs p-3 flex justify-center opacity-0 group-hover:opacity-100 transition-all">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerLiveTryOn(p);
                            }}
                            className="bg-[#D8C8F0] text-[#4b3c63] text-xs font-bold py-1.5 px-4 rounded-xl flex items-center gap-1.5 shadow"
                          >
                            <Camera className="w-3.5 h-3.5" /> Live Try-On
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Card Content details */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <span className="text-[10px] uppercase font-bold text-gray-400 block">
                          {p.category}
                        </span>
                        <h4
                          className="font-serif text-[15px] text-[#3c305a] font-bold group-hover:text-pink-800 transition-all cursor-pointer line-clamp-1"
                          onClick={() => setSelectedProduct(p)}
                        >
                          {p.name}
                        </h4>
                        
                        {/* Rating stars */}
                        <div className="flex items-center gap-1">
                          <span className="flex items-center text-amber-500">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < Math.floor(p.rating) ? "fill-amber-500" : "text-gray-200"
                                }`}
                              />
                            ))}
                          </span>
                          <span className="text-[10px] text-gray-500 font-bold">
                            {p.rating} ({p.reviewsCount})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-50">
                        <div>
                          <span className="text-sm font-bold text-[#3c305a]">₹{p.price}</span>
                          <span className="text-xs text-gray-400 line-through ml-1.5">
                            ₹{p.originalPrice}
                          </span>
                        </div>
                        <button
                          onClick={() => addToCart(p)}
                          className="bg-[#FFF9F4] hover:bg-[#D8C8F0]/30 text-[#4b3c63] border border-[#D8C8F0] p-2 rounded-xl transition-all"
                          title="Add to shopping basket"
                        >
                          <ShoppingBag className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Why Choose Niveha - Premium USP block */}
            <div className="bg-[#FFF9F4] rounded-[36px] p-8 md:p-14 border border-[#D8C8F0]/20 space-y-8">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <span className="text-xs uppercase tracking-widest text-[#4b3c63] font-bold">Uncompromising Quality</span>
                <h3 className="text-3xl font-serif text-[#3c305a]">Why Niveha is Loved Across India</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    title: "Authentic Kalamkari Designs",
                    description: "Handcrafted using vegetable dye block paintings from pristine clusters of Srikalahasti, Andhra Pradesh. We bring master artisan works directly to you.",
                    icon: <Award className="w-8 h-8 text-amber-600" />
                  },
                  {
                    title: "Affordable Modern Luxury",
                    description: "Experience premium, rich textures of linen, cotton and high-grade vegan canvas materials designed safely with premium metal locks without costing luxury premiums.",
                    icon: <SlidersHorizontal className="w-8 h-8 text-pink-600" />
                  },
                  {
                    title: "Express Fast India Delivery",
                    description: "Partnered with DTDC, Blue Dart, Ecom Express & Delhivery to promise secure tracking and swift courier fulfillment directly from Visakhapatnam to your home.",
                    icon: <Truck className="w-8 h-8 text-[#4b3c63]" />
                  }
                ].map((usp, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-50 shadow-2xs space-y-4">
                    <div className="w-14 h-14 bg-[#FFF9F4] rounded-full flex items-center justify-center border border-[#D8C8F0]/25">
                      {usp.icon}
                    </div>
                    <h4 className="font-serif text-lg font-bold text-[#3c305a]">{usp.title}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">{usp.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonials Review Slider */}
            <div className="space-y-6">
              <div className="text-center">
                <span className="text-xs uppercase tracking-widest font-bold text-[#4b3c63]">Voice of Comfort</span>
                <h3 className="text-3xl font-serif text-[#3c305a]">Testimonials From Our Patrons</h3>
              </div>

              <div className="relative max-w-4xl mx-auto bg-white rounded-3xl p-8 md:p-12 border border-[#D8C8F0]/30 shadow-md text-center">
                <div className="absolute top-4 left-6 text-7xl text-[#D8C8F0]/30 font-serif leading-none select-none">“</div>
                
                <div className="space-y-4 relative z-10">
                  <div className="flex justify-center text-amber-500">
                    {[...Array(reviews[activeReviewIdx].rating)].map((_, i) => (
                      <Star key={i} className="w-4.5 h-4.5 fill-amber-500" />
                    ))}
                  </div>
                  <p className="text-base text-gray-700 italic leading-relaxed font-serif px-4 md:px-12">
                    {reviews[activeReviewIdx].comment}
                  </p>
                  <div>
                    <h4 className="font-bold text-[#3c305a] text-sm">{reviews[activeReviewIdx].name}</h4>
                    <p className="text-[10px] text-gray-400 tracking-wider font-semibold flex items-center justify-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5" /> {reviews[activeReviewIdx].location}
                    </p>
                  </div>
                </div>

                {/* Left/Right Slider Handles */}
                <div className="flex justify-center gap-3 mt-6">
                  <button
                    onClick={() =>
                      setActiveReviewIdx((prev) => (prev === 0 ? reviews.length - 1 : prev - 1))
                    }
                    className="p-2 border rounded-full hover:bg-gray-50 text-gray-600 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      setActiveReviewIdx((prev) => (prev === reviews.length - 1 ? 0 : prev + 1))
                    }
                    className="p-2 border rounded-full hover:bg-gray-50 text-gray-600 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ==================== SHOP COLLECTION PAGE ==================== */}
        {activeTab === "shop" && !selectedProduct && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <span className="text-xs uppercase tracking-widest text-pink-700 font-bold">Niveha Showroom</span>
              <h2 className="text-3xl font-serif text-[#3c305a] mt-0.5">All Traditional & Modern Accessories</h2>
            </div>

            {/* Smart Search Query Input & Suggestions */}
            <div className="bg-white p-5 rounded-2xl border border-[#D8C8F0]/30 shadow-xs space-y-3">
              <div className="relative">
                <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ask smart search e.g. 'Kalamkari bag under ₹2000' or 'Traditional earrings'..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-50/50 border border-gray-200 focus:outline-none focus:border-[#4b3c63] rounded-xl text-xs text-[#3c305a] font-medium"
                />
              </div>

              {/* Instant suggested quick tags */}
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-[10px] text-gray-400 uppercase font-bold">Smart Searches:</span>
                {[
                  "Kalamkari bag under ₹1500",
                  "Traditional earrings",
                  "Women's sandals",
                  "Kundan Jhumkas under ₹1200",
                ].map((qStr, idx) => (
                  <button
                    key={idx}
                    onClick={() => parseSmartSearchAndApply(qStr)}
                    className="text-[11px] bg-[#D8C8F0]/15 hover:bg-[#D8C8F0]/30 text-[#4b3c63] px-2.5 py-1 rounded-full border border-[#D8C8F0]/30 transition-all cursor-pointer"
                  >
                    {qStr}
                  </button>
                ))}
              </div>
            </div>

            {/* Split layout: Filters left (3 Columns), Products right (9 Columns) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Product Filtering sidebar (3 Columns) */}
              <div className="lg:col-span-3 space-y-6">
                <div className="bg-white p-5 rounded-2xl border border-[#D8C8F0]/20 max-w-full space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h4 className="font-serif font-bold text-[#3c305a] flex items-center gap-1.5">
                      <SlidersHorizontal className="w-4 h-4 text-pink-700" /> Filter Criteria
                    </h4>
                    <button
                      onClick={() => {
                        setSelectedCategory("All");
                        setSelectedGender("All");
                        setMaxPrice(5000);
                        setSelectedMaterial("All");
                        setMinRating(0);
                        setSearchQuery("");
                      }}
                      className="text-[10px] text-red-500 hover:underline font-bold"
                    >
                      Reset All
                    </button>
                  </div>

                  {/* Filter elements */}
                  <div>
                    <label className="text-[11pt] font-serif font-bold block mb-1.5 text-gray-700">Category</label>
                    <div className="space-y-1">
                      {["All", "Earrings", "Jewellery", "Handbags", "Tote Bags", "Shoes", "Sandals", "Women's Fashion", "Men's Fashion", "Phone Cases"].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-all ${
                            selectedCategory === cat ? "bg-[#D8C8F0] text-[#4b3c63]" : "hover:bg-[#FFF9F4] text-gray-500"
                          }`}
                        >
                          {cat}
                          <span className="text-[9px] opacity-65">
                            ({cat === "All" ? products.length : products.filter(p => p.category === cat).length})
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11pt] font-serif font-bold block mb-1.5 text-gray-700">Target Audience</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {["All", "Men", "Women"].map((g) => (
                        <button
                          key={g}
                          onClick={() => setSelectedGender(g)}
                          className={`px-2 py-1.5 rounded-lg text-xs font-bold text-center border transition-all ${
                            selectedGender === g
                              ? "bg-[#4b3c63] text-white border-[#4b3c63]"
                              : "bg-white text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1.5">
                      <label className="text-[11pt] font-serif font-bold text-gray-700">Price Ceiling</label>
                      <span className="text-xs font-bold text-pink-700">₹{maxPrice}</span>
                    </div>
                    <input
                      type="range"
                      min="400"
                      max="5000"
                      step="100"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                      className="w-full accent-[#4b3c63]"
                    />
                  </div>

                  <div>
                    <label className="text-[11pt] font-serif font-bold block mb-1.5 text-gray-700">Premium Material</label>
                    <select
                      value={selectedMaterial}
                      onChange={(e) => setSelectedMaterial(e.target.value)}
                      className="w-full p-2 bg-gray-50/50 border border-gray-200 text-xs rounded-lg focus:outline-none focus:border-[#4b3c63]"
                    >
                      <option value="All">All Canvas & Metals</option>
                      <option value="Kalamkari Cotton">Kalamkari Cotton</option>
                      <option value="Leather">S sustainably-sourced Leather</option>
                      <option value="Brass">Gold Plated Brass</option>
                      <option value="Linen">Luxe Linen-Cotton</option>
                      <option value="Organza">Organza Silk Saree</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11pt] font-serif font-bold block mb-1.5 text-gray-700">Minimum Rating</label>
                    <div className="flex gap-1">
                      {[0, 3, 4, 4.5].map((rate) => (
                        <button
                          key={rate}
                          onClick={() => setMinRating(rate)}
                          className={`flex-1 py-1 rounded text-xs font-bold border transition-all ${
                            minRating === rate
                              ? "bg-[#DDE8D5] text-green-800 border-green-500"
                              : "text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {rate === 0 ? "All" : `${rate}★`}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              {/* Products List Grid (9 Columns) */}
              <div className="lg:col-span-9 space-y-4">
                <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-50 text-xs text-gray-500 font-bold">
                  <span>Showing {filteredProducts.length} Premium Indian Masterworks</span>
                  <span>Currency: INR (₹)</span>
                </div>

                {filteredProducts.length === 0 ? (
                  <div className="bg-white p-12 text-center rounded-3xl border border-dashed text-gray-500 space-y-3">
                    <SlidersHorizontal className="w-12 h-12 text-gray-300 mx-auto" />
                    <h4 className="font-serif text-lg font-bold text-[#3c305a]">No Products Match Current Criteria</h4>
                    <p className="text-xs text-gray-400">
                      Kindly clear your active filters or smart search query key word.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((p) => (
                      <div
                        key={p.id}
                        className="bg-white rounded-3xl overflow-hidden border border-gray-150 hover:border-[#D8C8F0]/80 shadow-2xs hover:shadow-lg transition-all flex flex-col justify-between group h-full relative"
                      >
                        {/* Wishlist Toggle Button */}
                        <button
                          onClick={() => toggleWishlist(p)}
                          className="absolute top-4 right-4 z-10 bg-white/70 backdrop-blur-xs p-2 rounded-full shadow-md text-gray-400 hover:text-red-500 transition-all"
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              wishlist.find((item) => item.id === p.id) ? "fill-red-500 text-red-500" : ""
                            }`}
                          />
                        </button>

                        <div className="cursor-pointer" onClick={() => setSelectedProduct(p)}>
                          <div className="relative aspect-square overflow-hidden bg-gray-50">
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                            />
                            {p.isKalamkari && (
                              <span className="absolute top-4 left-4 bg-amber-600 text-white text-[8px] font-black uppercase px-2.5 py-1 rounded-full shadow">
                                PEN KALAMKARI
                              </span>
                            )}
                            
                            {/* Live Overlays Button */}
                            {p.tryOnType && (
                              <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2.5 flex justify-center opacity-0 group-hover:opacity-100 transition-all">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    triggerLiveTryOn(p);
                                  }}
                                  className="bg-[#D8C8F0] hover:bg-[#c9b7e7] text-[#4b3c63] text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm"
                                >
                                  <Camera className="w-3 h-3" /> Try On Live
                                </button>
                              </div>
                            )}
                          </div>

                          <div className="p-4 space-y-1">
                            <span className="text-[9px] uppercase font-bold text-gray-400 block pb-1">
                              {p.category}
                            </span>
                            <h4 className="font-serif text-[14px] text-[#3c305a] font-bold line-clamp-1">
                              {p.name}
                            </h4>
                            <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
                              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                              <span>{p.rating} / 5</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 pt-0">
                          <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                            <div>
                              <span className="text-xs font-extrabold text-[#4b3c63]">₹{p.price}</span>
                              <span className="text-[10px] text-gray-400 line-through ml-1.5">
                                ₹{p.originalPrice}
                              </span>
                            </div>
                            <button
                              onClick={() => addToCart(p)}
                              className="bg-[#D8C8F0]/30 hover:bg-[#D8C8F0] text-[#4b3c63] text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                            >
                              Add to cart
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ===================== STORYTELLING KALAMKARI HERITAGE PAGE ===================== */}
        {activeTab === "kalamkari" && (
          <div className="space-y-12 animate-fade-in text-justify">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <span className="text-xs uppercase tracking-widest text-[#4b3c63] font-bold px-3 py-1 bg-[#D8C8F0]/30 rounded-full">
                Srikalahasti & Machilipatnam Heritage
              </span>
              <h2 className="text-4xl font-serif text-[#3c305a] tracking-tight">The Sacred Art of Kalamkari</h2>
              <p className="text-xs text-gray-500 italic">
                From ancient temple scrolls to premium modern wardrobes - we honor Andhra's master weavers.
              </p>
            </div>

            {/* Banner block */}
            <div className="relative aspect-[16/7] md:aspect-[21/9] rounded-3xl overflow-hidden shadow-xl border-4 border-white">
              <img
                src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1200"
                alt="Intricate Fabric Design representation"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 md:p-12 text-white">
                <span className="text-[9px] bg-amber-500 text-black font-extrabold px-3 py-1.5 rounded-full w-max tracking-wide">
                  LIMITLESS ARTISANAL VALUE
                </span>
                <h3 className="text-xl md:text-3xl font-serif mt-2">Connecting viscounts with rural craft collectives</h3>
                <p className="text-xs text-gray-300 max-w-xl mt-1 leading-relaxed hidden sm:block">
                  At Niveha Studio in Visakhapatnam, we partner with Pen Kalamkari clusters who use milk baths, bamboo pointers (kalam) & pure vegetable extract paints to detail legendary tree of life panels.
                </p>
              </div>
            </div>

            {/* Story Grid columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <h4 className="font-serif text-2xl text-[#3c305a]">1. Meaning of the Pen (Kalam)</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Literally translated, **Kalamkari** is 'Kalam' (pen) and 'Kari' (craftsmanship). It is an exquisite ancient art originating from Srikalahasti, Andhra Pradesh. Each premium piece of fabric undergo a complex 23-step process of cleaning, block dyeing, milk treatments, washing in clean streams of flowing rivers, and fine details using organic indigo, madder roots, block charcoal, and mustard plant pastes.
                </p>
                <blockquote className="bg-[#FFF9F4] pl-4 border-l-4 border-amber-600 text-[#4b3c63] italic py-2 text-xs">
                  “The earthy organic scent of authentic Pen Kalamkari tells the tale of Visakhapatnam seaside air mixed with riverine wood ash.”
                </blockquote>
              </div>
              <div className="space-y-4">
                <h4 className="font-serif text-2xl text-[#3c305a]">2. Sustainable & Organic Fashion</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Unlike fast synthetic chemical imports that pollute our watersheds, Niveha's signature handbags and totes support organic cotton threads. Standard cotton panels are treated in high-grade wild buffalo milk and natural myrobalan seeds, creating a beautiful cream base that matches cream whites, sage greens and lavender luxury tones effortlessly.
                </p>
                <div className="bg-[#DDE8D5]/40 border border-emerald-300 p-4 rounded-2xl flex items-center gap-3">
                  <span className="text-2xl text-emerald-700">🌱</span>
                  <div className="text-xs">
                    <h5 className="font-bold text-[#3c305a]">Artisan-First Profit Structure</h5>
                    <p className="text-gray-500 mt-0.5">
                      40% of every handbag price goes back directly to our rural artisan collectives in AP.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Artisan Showcase Limited Edition */}
            <div className="bg-[#FFF9F4] rounded-3xl p-8 border border-amber-300/30 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-4">
                <img
                  src="https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=500"
                  alt="Rural artist drawing representation"
                  className="rounded-2xl border"
                />
              </div>
              <div className="lg:col-span-8 space-y-4">
                <span className="text-xs bg-amber-100 text-amber-800 px-3 py-1 rounded font-bold uppercase">
                  AP Heritage Artisan Masterwork
                </span>
                <h4 className="font-serif text-2xl text-[#3c305a]">Meet Sri Subbaiah Chary</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Subbaiah is a third-generation Pen Kalamkari painter from Visakhapatnam district hinterland. Using wooden block handcraft tools and traditional dyes, he spent over 12 days sketching block patterns for the **Heritage Royal Tote** bag available inside our store. By taking this home, you honor a century-old visual memory.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory("Tote Bags");
                    setActiveTab("shop");
                  }}
                  className="bg-[#4b3c63] hover:bg-[#34284b] text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-full cursor-pointer transition-all"
                >
                  Buy Sri Subbaiah's Tote (₹1899)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================== DETAILED PRODUCT VIEW MODULE ===================== */}
        {selectedProduct && (
          <div className="space-y-12 animate-fade-in">
            {/* Breadcrumb navigator row */}
            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
              <button onClick={() => setSelectedProduct(null)} className="hover:underline">
                Home
              </button>
              <ChevronRight className="w-3.5 h-3.5" />
              <button
                onClick={() => {
                  setSelectedCategory(selectedProduct.category);
                  setActiveTab("shop");
                  setSelectedProduct(null);
                }}
                className="hover:underline"
              >
                {selectedProduct.category}
              </button>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-[#3c305a] font-bold">{selectedProduct.name}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Product Photos with interactive zoom (6 Columns) */}
              <div className="lg:col-span-6 space-y-4">
                <div className="relative aspect-square rounded-3xl overflow-hidden bg-white border border-gray-150 shadow-inner flex items-center justify-center">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover transition-transform duration-300"
                    style={{ transform: `scale(${detailZoom})` }}
                  />
                  <div className="absolute top-4 left-4 bg-[#FFF9F4]/90 text-[#4b3c63] text-[9px] font-bold px-2 py-1 rounded w-max border border-gray-100 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Fast Dispatch: Vizag Studio
                  </div>

                  {/* Absolute Zoom buttons overlay */}
                  <div className="absolute bottom-4 right-4 bg-white/80 p-1 rounded-lg flex gap-1 z-10 border shadow-xs">
                    <button
                      onClick={() => setDetailZoom((z) => Math.min(2, z + 0.25))}
                      className="p-1 text-gray-700 hover:bg-gray-100 rounded cursor-pointer"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-4.5 h-4.5" />
                    </button>
                    <button
                      onClick={() => setDetailZoom((z) => Math.max(1, z - 0.25))}
                      className="p-1 text-gray-700 hover:bg-gray-100 rounded cursor-pointer"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>

                {/* Micro zoom hint */}
                <p className="text-[11px] text-gray-400 text-center italic">
                  Drag/click the zoom tools to inspect the minute weave details.
                </p>
              </div>

              {/* Product Specs Detail Panel (6 Columns) */}
              <div className="lg:col-span-6 space-y-6">
                <div>
                  <span className="text-xs uppercase bg-[#F8D7DA]/80 text-[#8c4c51] px-3 py-1 rounded-full font-bold">
                    {selectedProduct.category}
                  </span>
                  <h2 className="text-3xl font-serif font-black text-[#3c305a] mt-2 leading-snug">
                    {selectedProduct.name}
                  </h2>
                  
                  {/* Reviews review summary stars */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="flex text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                      ))}
                    </span>
                    <span className="text-xs font-bold text-gray-500 mt-0.5">
                      {selectedProduct.rating} / 5 ({selectedProduct.reviewsCount} customer reviews)
                    </span>
                  </div>
                </div>

                <div className="border-y py-4 border-gray-100">
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl font-serif text-[#4b3c63] font-bold">₹{selectedProduct.price}</span>
                    <span className="text-sm text-gray-400 line-through">₹{selectedProduct.originalPrice}</span>
                    <span className="text-xs bg-[#DDE8D5] text-[#2c4021] border border-green-500/20 px-2 py-0.5 rounded-full font-bold">
                      Save ₹{selectedProduct.originalPrice - selectedProduct.price} Instantly
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">Inclusive of all local Indian GST taxes.</p>
                </div>

                {/* Sub Description */}
                <p className="text-xs text-gray-600 leading-relaxed">
                  {selectedProduct.description}
                </p>

                {/* Conditional details attributes */}
                <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-2xl border border-gray-100 text-xs">
                  <div>
                    <span className="text-gray-400 block uppercase tracking-wider text-[9px] font-bold">Material Composition</span>
                    <span className="font-semibold text-gray-800">{selectedProduct.material || "Organic Handloom Cotton"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block uppercase tracking-wider text-[9px] font-bold">Inventory status</span>
                    <span className="font-semibold text-green-700">
                      {selectedProduct.inventory > 8 ? "✔️ In stock (Limited edition)" : `⚠️ Low count: Only ${selectedProduct.inventory} left`}
                    </span>
                  </div>
                </div>

                {/* Interactive Fitting Action Handles */}
                <div className="space-y-3 pt-2">
                  <div className="flex gap-3">
                    <button
                      onClick={() => addToCart(selectedProduct)}
                      className="flex-1 bg-[#4b3c63] hover:bg-[#34284b] text-[#FFF9F4] py-4.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md transform hover:translate-y-[-2px] cursor-pointer text-center"
                    >
                      Add To Shopping Bag
                    </button>
                    
                    <button
                      onClick={() => {
                        addToCart(selectedProduct);
                        // Open cart element directly
                        setIsCheckingOut(false);
                        const element = document.getElementById("cart-slide-panel");
                        if (element) {
                          element.scrollIntoView({ behavior: "smooth" });
                        }
                      }}
                      className="flex-1 bg-[#DDE8D5] hover:bg-[#cbd9c1] text-[#2c4021] py-4.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer text-center"
                    >
                      Instant Buy Now
                    </button>
                  </div>

                  {/* Core virtual try-on call action */}
                  {selectedProduct.tryOnType && (
                    <div className="p-4 bg-gradient-to-r from-[#D8C8F0]/30 to-[#F8D7DA]/30 rounded-2xl border border-[#D8C8F0]/40 text-center space-y-2">
                      <p className="text-xs text-gray-700 font-bold flex items-center justify-center gap-1.5">
                        <Sparkles className="w-4.5 h-4.5 text-amber-500 fill-amber-300 animate-pulse" /> Try on this {selectedProduct.category.toLowerCase().replace("'s fashion", "")} virtual fitting room
                      </p>
                      
                      <div className="flex flex-col sm:flex-row gap-2 justify-center pt-1.5">
                        <button
                          onClick={() => triggerLiveTryOn(selectedProduct)}
                          className="bg-[#4b3c63] text-[#FFF9F4] hover:bg-black text-[11px] font-bold px-5 py-2.5 rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition-all shadow-xs"
                        >
                          <Camera className="w-4 h-4" /> Try Live Using Camera
                        </button>
                        <button
                          onClick={() => triggerLiveTryOn(selectedProduct)}
                          className="bg-white hover:bg-gray-50 text-gray-700 text-[11px] font-bold px-4 py-2.5 rounded-xl border border-gray-200 cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Upload className="w-4 h-4" /> Upload Custom Photo & Fit
                        </button>
                        <button
                          onClick={() => {
                            // Focus chatbot elements
                            const chatEl = document.getElementById("nivi-chatbot-toggle");
                            if (chatEl) {
                              chatEl.click();
                            } else {
                              alert("Please click the floating Nivi AI Stylist bubble at the bottom right corner.");
                            }
                          }}
                          className="bg-white hover:bg-gray-50 text-pink-700 font-black text-[11px] px-4 py-2.5 rounded-xl border border-[#F8D7DA] flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          Ask Nivi AI ✨
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Supported payment icons block */}
                <div className="pt-4 border-t border-gray-100 text-center">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-2">
                    🔒 Supported checkout methods across India:
                  </p>
                  <p className="text-[11px] text-gray-500 font-bold">
                    UPI (PhonePe, GPay, Paytm) • Credit/Debit Cards (Visa, RuPay) • Cash on Delivery (COD)
                  </p>
                </div>
              </div>

            </div>

            {/* Smart Recommendation Engine section below details */}
            <div className="space-y-6 pt-10 border-t border-gray-100">
              <div className="text-left">
                <span className="text-xs bg-[#DDE8D5] text-[#2c4021] border border-green-500/20 px-2.5 py-1 rounded-full font-bold uppercase">
                  Frequently Bought Together
                </span>
                <h3 className="text-2xl font-serif text-[#3c305a] mt-2">Stylized Coordinate Recommendations</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                {products
                  .filter((p) => p.id !== selectedProduct.id)
                  .slice(0, 4)
                  .map((rec) => (
                    <div
                      key={rec.id}
                      onClick={() => setSelectedProduct(rec)}
                      className="bg-white p-3 rounded-2xl border border-gray-150 hover:border-[#D8C8F0]/40 cursor-pointer text-center space-y-2 hover:scale-[1.02] transition-all"
                    >
                      <img src={rec.image} alt={rec.name} className="w-full aspect-square object-cover rounded-xl" />
                      <h4 className="text-xs font-bold text-gray-800 line-clamp-1">{rec.name}</h4>
                      <p className="text-xs text-[#4b3c63] font-bold">₹{rec.price}</p>
                    </div>
                  ))}
              </div>
            </div>

          </div>
        )}

        {/* ===================== SHOPPING BASKET SUMMARY PANEL ===================== */}
        <div id="cart-slide-panel" className="mt-16 bg-white rounded-3xl p-6 md:p-8 border border-[#D8C8F0]/40 shadow-lg space-y-8">
          <div className="flex justify-between items-center border-b pb-4">
            <h3 className="text-2xl font-serif font-black text-[#3c305a] flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-pink-700" /> My Checkout Bag (INR Prices)
            </h3>
            <span className="text-xs text-gray-500 font-semibold uppercase">
              {cart.length} unique handcrafted items queued
            </span>
          </div>

          {cart.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <span className="text-4xl block">🛍️</span>
              <p className="text-xs text-gray-500 font-medium">Your shopping bag is currently empty.</p>
              <button
                onClick={() => {
                  setActiveTab("shop");
                  setSelectedProduct(null);
                }}
                className="bg-[#D8C8F0] hover:bg-[#c9b7e7] text-[#4b3c63] text-xs font-bold px-6 py-2.5 rounded-full cursor-pointer transition-all"
              >
                Go Shop Collection
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Basket list (8 Columns) */}
              <div className="lg:col-span-8 space-y-4">
                {cart.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100 gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-16 h-20 object-cover rounded-xl border bg-white shrink-0"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-gray-800 leading-snug">{item.product.name}</h4>
                        <p className="text-[10px] text-gray-400 uppercase font-semibold mt-1">
                          Category: {item.product.category}
                        </p>
                        
                        <div className="flex gap-2 mt-1.5 text-[9px] text-[#4b3c63] font-bold">
                          <button
                            onClick={() => saveForLaterItem(idx)}
                            className="bg-[#FFF9F4] border hover:bg-gray-100 px-2 py-0.5 rounded"
                          >
                            Save for later
                          </button>
                          <button
                            onClick={() => removeFromCart(idx)}
                            className="text-red-500 hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 border-t sm:border-t-0 pt-3 sm:pt-0">
                      {/* Quantity handles */}
                      <div className="flex items-center border bg-white rounded-lg px-1 py-0.5 self-center">
                        <button
                          onClick={() => updateQuantity(idx, -1)}
                          className="px-2 py-1 text-gray-500 hover:bg-gray-100 rounded"
                        >
                          -
                        </button>
                        <span className="px-3 text-xs font-bold text-gray-800">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(idx, 1)}
                          className="px-2 py-1 text-gray-500 hover:bg-gray-100 rounded"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-gray-800 block">
                          ₹{item.product.price * item.quantity}
                        </span>
                        <span className="text-[10px] text-gray-400 block font-medium">
                          (₹{item.product.price} each)
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Saved for later shelf */}
                {savedForLater.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-gray-100 space-y-3">
                    <h4 className="font-serif text-sm font-bold text-gray-500">Saved For Later List:</h4>
                    {savedForLater.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-[#FFF9F4]/30 rounded-xl border border-[#D8C8F0]/20"
                      >
                        <div className="flex items-center gap-3">
                          <img src={item.product.image} className="w-10 h-12 object-cover rounded-lg" />
                          <div>
                            <h5 className="text-[11px] font-bold text-gray-800">{item.product.name}</h5>
                            <p className="text-[10px] text-gray-500">₹{item.product.price}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => moveToCartFromLater(index)}
                          className="bg-white border hover:bg-[#FFF9F4] text-[#4b3c63] text-[10px] font-bold px-3 py-1.5 rounded-lg"
                        >
                          Move back to active bag
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Order financial checkout inputs (4 Columns) */}
              <div className="lg:col-span-4 bg-[#FFF9F4]/50 p-6 rounded-2xl border border-[#D8C8F0]/30 space-y-4">
                <h4 className="font-serif font-black text-[#3c305a] text-sm">Order Checkout Ledger</h4>
                
                {/* Coupon application panel */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-500 block">Apply Coupon Promo:</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="e.g. NIVEHA10, WELCOME20"
                      className="flex-1 px-3 py-2 border text-xs bg-white focus:outline-none focus:border-[#4b3c63] rounded-lg tracking-widest uppercase font-mono"
                    />
                    <button
                      onClick={applyCoupon}
                      className="bg-[#4b3c63] text-white px-3 py-2 rounded-lg text-xs font-bold shrink-0 cursor-pointer"
                    >
                      Apply Code
                    </button>
                  </div>
                  
                  {couponError && <p className="text-[10px] text-red-600 font-bold">{couponError}</p>}
                  {couponSuccess && <p className="text-[10px] text-green-700 font-bold">{couponSuccess}</p>}
                </div>

                {/* Core sums */}
                <div className="space-y-2 pt-2 border-t border-gray-200 text-xs">
                  <div className="flex justify-between font-bold text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{getSubtotal()}</span>
                  </div>
                  {activeDiscount && (
                    <div className="flex justify-between font-bold text-emerald-700">
                      <span>Promo Discount ({activeDiscount.code})</span>
                      <span>-₹{getDiscount()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-gray-600">
                    <span>Shipping Insurance</span>
                    <span className="text-emerald-700">FREE promo</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-[#3c305a] pt-2 border-t">
                    <span>Grand Total amount</span>
                    <span>₹{getFinalTotal()}</span>
                  </div>
                </div>

                {isCheckingOut ? (
                  <form onSubmit={handlePlaceOrder} className="pt-4 border-t border-gray-100 space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-gray-500 block">Recipient billing name</label>
                      <input
                        type="text"
                        required
                        value={checkoutName}
                        onChange={(e) => setCheckoutName(e.target.value)}
                        placeholder="e.g. Radhika Sharma"
                        className="w-full p-2 border bg-white rounded-lg text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-gray-500 block">India courier Phone number</label>
                      <input
                        type="tel"
                        required
                        value={checkoutPhone}
                        onChange={(e) => setCheckoutPhone(e.target.value)}
                        placeholder="e.g. +91 98765 43210"
                        className="w-full p-2 border bg-white rounded-lg text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-gray-500 block">Home/Studio Address</label>
                      <input
                        type="text"
                        required
                        value={checkoutStreet}
                        onChange={(e) => setCheckoutStreet(e.target.value)}
                        placeholder="Suite room, street coordinates"
                        className="w-full p-2 border bg-white rounded-lg text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-gray-500 block">City</label>
                        <input
                          type="text"
                          required
                          value={checkoutCity}
                          onChange={(e) => setCheckoutCity(e.target.value)}
                          className="w-full p-2 border bg-white rounded-lg text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-gray-500 block">Pincode</label>
                        <input
                          type="text"
                          required
                          value={checkoutPincode}
                          onChange={(e) => setCheckoutPincode(e.target.value)}
                          className="w-full p-2 border bg-white rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    {/* Payment methods choice */}
                    <div className="space-y-2 pt-2">
                      <label className="text-[10px] uppercase font-bold text-gray-500 block">Choose Payment Method</label>
                      <div className="grid grid-cols-3 gap-2">
                        {["UPI", "Card", "COD"].map((method) => (
                          <button
                            key={method}
                            type="button"
                            onClick={() => setPaymentMethod(method)}
                            className={`py-1.5 rounded font-bold text-xs border text-center transition-all ${
                              paymentMethod === method
                                ? "bg-[#4b3c63] text-white border-[#4b3c63]"
                                : "bg-white text-gray-500"
                            }`}
                          >
                            {method}
                          </button>
                        ))}
                      </div>

                      {paymentMethod === "UPI" && (
                        <select
                          value={selectedUpi}
                          onChange={(e) => setSelectedUpi(e.target.value)}
                          className="w-full p-2 bg-white border text-xs rounded-lg focus:outline-none"
                        >
                          <option value="Google Pay">Google Pay (gpay)</option>
                          <option value="PhonePe">PhonePe (bhagwat)</option>
                          <option value="Paytm">Paytm wallet</option>
                          <option value="BHIM UPI">BHIM UPI</option>
                        </select>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-3 rounded-xl font-bold transition-all shadow cursor-pointer text-center block"
                    >
                      Securely Pay ₹{getFinalTotal()} & Book Look
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setIsCheckingOut(true)}
                    className="w-full bg-[#4b3c63] hover:bg-[#34284b] text-white text-xs py-3.5 rounded-xl font-bold transition-all shadow cursor-pointer text-center block uppercase tracking-wider"
                  >
                    Proceed to Indian Billing Checkout
                  </button>
                )}
              </div>

            </div>
          )}
        </div>

        {/* ===================== POST PURCHASE ORDER SUCCESS & FEEDBACK OPT-IN FORM ===================== */}
        {orderComplete && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-xs">
            <div className="bg-[#FFF9F4] rounded-3xl p-6 md:p-8 max-w-2xl w-full border border-[#D8C8F0] shadow-2xl relative my-8 text-center space-y-6">
              
              <div className="space-y-2">
                <div className="w-16 h-16 bg-emerald-100 border border-emerald-300 text-emerald-700 rounded-full flex items-center justify-center mx-auto text-3xl shadow-inner animate-bounce">
                  ✓
                </div>
                <h3 className="font-serif text-3xl text-emerald-800">Your Niveha Order is Secured!</h3>
                <p className="text-xs text-gray-400">
                  Transaction code: <strong className="font-mono text-gray-700">{orderComplete.id}</strong>
                </p>
              </div>

              {/* Order details summary block */}
              <div className="bg-white p-4.5 rounded-2xl border border-gray-150 text-left space-y-3 text-xs">
                <p className="font-bold border-b pb-1.5 text-[#3c305a]">Delivery Logistics Details:</p>
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <div>
                    <span className="text-gray-400 block text-[9px] uppercase font-bold">Estimated Hand Delivery</span>
                    <span className="font-semibold text-gray-800">{orderComplete.estimatedDelivery}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[9px] uppercase font-bold">Tracking Carrier Waybill</span>
                    <span className="font-mono text-[#4b3c63] font-bold">{orderComplete.trackingNumber}</span>
                  </div>
                </div>
                <div className="border-t pt-1.5 text-gray-500 leading-normal">
                  Our courier partners (Delhivery, DTDC, Blue Dart) will notify you via SMS when package leaves our <strong>Visakhapatnam Studio</strong>.
                </div>
              </div>

              {/* Feedback Form Rating Panel */}
              <div className="bg-gradient-to-r from-[#D8C8F0]/20 to-[#F8D7DA]/20 p-5 rounded-2xl border border-[#D8C8F0]/30 space-y-4">
                <div className="border-b pb-2">
                  <h4 className="font-serif font-black text-[#3c305a] text-sm">How was your premium styling experience?</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">Your inputs are stored securely in studio registers.</p>
                </div>

                {feedbackSubmitted ? (
                  <div className="py-4 text-[#2c4021] bg-emerald-50 rounded-lg text-xs font-bold animate-pulse">
                    🙏🙏 namaste! Thank you for the authentic feedback on Niveha.
                  </div>
                ) : (
                  <form onSubmit={handleSubmitFeedback} className="space-y-4 text-left">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                      <div>
                        <span className="text-[9px] text-gray-500 uppercase font-black block mb-1">Product Quality</span>
                        <div className="flex justify-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setRateQuality(s)}
                              className={`text-[12px] ${s <= rateQuality ? "text-amber-500" : "text-gray-300"}`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-[9px] text-gray-500 uppercase font-black block mb-1">Packaging design</span>
                        <div className="flex justify-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setRatePackaging(s)}
                              className={`text-[12px] ${s <= ratePackaging ? "text-amber-500" : "text-gray-300"}`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-[9px] text-gray-500 uppercase font-black block mb-1">Delivery Time</span>
                        <div className="flex justify-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setRateDelivery(s)}
                              className={`text-[12px] ${s <= rateDelivery ? "text-amber-500" : "text-gray-300"}`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-[9px] text-gray-500 uppercase font-black block mb-1">Web Experience</span>
                        <div className="flex justify-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setRateWeb(s)}
                              className={`text-[12px] ${s <= rateWeb ? "text-amber-500" : "text-gray-300"}`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-gray-500 block">Suggestions or special instructions?</label>
                      <textarea
                        rows={2}
                        value={suggestions}
                        onChange={(e) => setSuggestions(e.target.value)}
                        placeholder="e.g. Please wrap with organic flower motifs..."
                        className="w-full p-2 border bg-white rounded-lg text-xs"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 bg-[#4b3c63] hover:bg-[#34284b] text-white text-xs font-bold py-2.5 rounded-lg text-center"
                      >
                        Submit Feedback
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrderComplete(null)}
                        className="px-4 border text-xs rounded-lg text-gray-500 hover:bg-gray-100"
                      >
                        Skip
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===================== USER ACCOUNT DASHBOARD VIEW ===================== */}
        {activeTab === "dashboard" && (
          <div className="space-y-10 animate-fade-in">
            <div className="border-b pb-4">
              <span className="text-xs uppercase bg-[#D8C8F0]/45 text-[#4b3c63] font-black px-3 py-1 rounded-full">
                Welcome, bhavyasaimudunuri@gmail.com
              </span>
              <h2 className="text-3xl font-serif text-[#3c305a] mt-2">Bhavyasai's Style Hub</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Order lists tracking (2 Columns) */}
              <div className="md:col-span-2 space-y-6">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
                  <h3 className="font-serif text-lg font-bold text-[#3c305a] flex items-center gap-1.5 border-b pb-2">
                    <Package className="w-5 h-5 text-pink-700" /> Historic Purchase Records ({orders.length})
                  </h3>

                  {orders.length === 0 ? (
                    <div className="py-8 text-center text-gray-400 text-xs">
                      No active orders parsed. Purchase an item in the checkout above to seed your dashboard!
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((ord, idx) => (
                        <div key={idx} className="p-4 bg-[#FFF9F4]/40 border rounded-xl space-y-3">
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Order reference: <strong>{ord.id}</strong></span>
                            <span className="bg-green-100 text-green-800 font-bold px-2.5 py-0.5 rounded-full uppercase text-[9px]">
                              {ord.status}
                            </span>
                          </div>

                          <div className="border-t border-dashed pt-2 space-y-1">
                            {ord.items.map((it, oIdx) => (
                              <div key={oIdx} className="flex justify-between text-xs font-bold text-gray-800">
                                <span>{it.product.name} (x{it.quantity})</span>
                                <span>₹{it.product.price * it.quantity}</span>
                              </div>
                            ))}
                          </div>

                          <div className="flex justify-between items-center text-xs pt-2 border-t font-semibold text-gray-600">
                            <span>Total cost: ₹{ord.totalAmount}</span>
                            <span className="text-pink-700">Courier: {ord.trackingNumber}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Return window info */}
                <div className="bg-amber-50 rounded-2xl p-4.5 border border-amber-300/30 text-xs flex gap-3">
                  <div className="text-xl">⚠️</div>
                  <div className="text-amber-800 space-y-1">
                    <h5 className="font-bold">7-Day Hassle Free Returns Policies</h5>
                    <p>
                      Should any organic block printed motif have tiny spacing alignments which don't suit your styling perfectly, initiate returns directly in chat with Nivi AI within 7 business days.
                    </p>
                  </div>
                </div>
              </div>

              {/* Saved Address book & Wishlist elements */}
              <div className="space-y-6">
                
                {/* Wishlist Boxed element summaries */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
                  <h3 className="font-serif text-base font-bold text-[#3c305a] flex items-center gap-1 border-b pb-2">
                    <Heart className="w-4 h-4 text-red-500 fill-red-500" /> Saved Favourites ({wishlist.length})
                  </h3>

                  {wishlist.length === 0 ? (
                    <p className="text-xs text-gray-400 py-3 text-center">
                      Click the heart motif icon on any Kalamkari handbag or jhumka card to fill your wishlist container.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {wishlist.map((item) => (
                        <div
                          key={item.id}
                          className="bg-[#FFF9F4]/40 p-2 rounded-xl text-center border relative cursor-pointer"
                          onClick={() => setSelectedProduct(item)}
                        >
                          <img src={item.image} alt={item.name} className="w-full aspect-square object-cover rounded-lg" />
                          <h4 className="text-[10px] font-bold text-gray-800 line-clamp-1 mt-1">{item.name}</h4>
                          <span className="text-xs font-black text-gray-800 block">₹{item.price}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Default Address Book */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-3 text-xs">
                  <h3 className="font-serif font-black text-[#3c305a] border-b pb-2">My Saved Address Details</h3>
                  <div className="space-y-1 text-gray-600">
                    <p className="font-bold">Bhavyasai Mudunuri</p>
                    <p>MVP Colony, Near Beach Road</p>
                    <p>Visakhapatnam, Andhra Pradesh - 530017</p>
                    <p>India • phone: +91 98765 43210</p>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* ===================== STUDIO ADMIN METRICS DASHBOARD VIEW ===================== */}
        {activeTab === "admin" && (
          <div className="space-y-10 animate-fade-in">
            <div className="border-b pb-4">
              <span className="text-xs uppercase bg-[#DDE8D5] text-[#2c4021] border border-green-600/35 px-3 py-1 rounded-full font-bold">
                Niveha Studio Controller Panel
              </span>
              <h2 className="text-3xl font-serif text-[#3c305a] mt-2">Visakhapatnam Studio Analytics</h2>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs space-y-1">
                <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest block">Gross Income Revenue</span>
                <h4 className="text-2xl font-serif font-black text-gray-800">
                  ₹{orders.reduce((s, o) => s + o.totalAmount, 73000)}
                </h4>
                <p className="text-[9px] text-emerald-600 font-bold">▲ 14% vs. traditional boutique baseline</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs space-y-1">
                <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest block">Active Stock catalog</span>
                <h4 className="text-2xl font-serif font-black text-gray-800">
                  {products.length} units
                </h4>
                <p className="text-[9px] text-gray-500 font-bold">7 custom categories in store</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs space-y-1">
                <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest block">Orders Placed</span>
                <h4 className="text-2xl font-serif font-black text-gray-800">
                  {orders.length + 18} files
                </h4>
                <p className="text-[9px] text-orange-600 font-bold">Pending: 1 awaiting Srikalahasti wash</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs space-y-1">
                <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest block">Average rating Score</span>
                <h4 className="text-2xl font-serif font-black text-gray-800">
                  4.8 / 5.0
                </h4>
                <p className="text-[9px] text-green-700 font-bold">Based on {reviews.length + feedbacks.length} patron testimonials</p>
              </div>
            </div>

            {/* In-Depth Feedback submissions list */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10">
              
              {/* Left Column: Feedbacks (8 Columns) */}
              <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-gray-150 shadow-xs space-y-4">
                <h3 className="font-serif text-lg font-bold text-gray-800 flex items-center gap-1.5 border-b pb-2">
                  <FileText className="w-5 h-5 text-amber-600" /> Secure Customer Feedback Log entries ({feedbacks.length})
                </h3>

                {feedbacks.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-6">
                    Awaiting raw post-order ratings submissions. Try booking an order to see feedback registers fill dynamically!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {feedbacks.map((fb, idx) => (
                      <div key={idx} className="p-4 bg-gray-50 rounded-xl space-y-2 text-xs">
                        <div className="flex justify-between items-center bg-white p-2 rounded border">
                          <span className="font-mono text-[9px] text-gray-500">ID reference: {fb.id}</span>
                          <span className="text-[9.5px] font-bold text-gray-600">Date: {new Date(fb.timestamp).toLocaleString()}</span>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-semibold text-gray-600">
                          <div className="bg-white py-1 rounded">Quality: {fb.productQuality}/5</div>
                          <div className="bg-white py-1 rounded">Packaging: {fb.packaging}/5</div>
                          <div className="bg-white py-1 rounded">Delivery: {fb.delivery}/5</div>
                          <div className="bg-white py-1 rounded">Website: {fb.websiteExperience}/5</div>
                        </div>

                        {fb.suggestions && (
                          <div className="p-2.5 bg-[#FFF9F4] rounded border-l-2 border-pink-700 italic">
                            “ {fb.suggestions} ”
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Inventory metrics items review (4 Columns) */}
              <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-gray-150 shadow-xs space-y-4 text-xs">
                <h3 className="font-serif font-black text-gray-800 border-b pb-2">Active Studio Warehouses</h3>
                <div className="space-y-3">
                  {products.slice(0, 5).map((p) => (
                    <div key={p.id} className="flex justify-between items-center py-1 border-b border-gray-100">
                      <div>
                        <p className="font-bold text-gray-800 line-clamp-1">{p.name}</p>
                        <p className="text-[10px] text-gray-400 uppercase">Category: {p.category}</p>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded font-mono text-[10px] font-bold shrink-0 ${
                        p.inventory > 10 ? "bg-green-150 text-green-800" : "bg-red-50 text-red-600"
                      }`}>
                        {p.inventory} left
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* 4. Global Floating Virtual Try-On Modal backdrop */}
      {showTryOnModal && activeTryOnItem && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[36px] w-full max-w-5xl shadow-2xl overflow-hidden relative border border-[#D8C8F0]/30">
            {/* Absolute Close */}
            <button
              onClick={() => {
                setShowTryOnModal(false);
                setActiveTryOnItem(null);
              }}
              className="absolute top-4 right-4 z-40 bg-[#FFF9F4] text-[#4b3c63] p-2 rounded-full border shadow hover:scale-105 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-4 md:p-8">
              <VirtualTryOn
                selectedProduct={activeTryOnItem}
                allProducts={products}
                onAddToCart={(prod) => {
                  addToCart(prod);
                  setShowTryOnModal(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 5. Floating Intelligent Fashion bot Nivi Chatbot */}
      <NiviChatbot />

      {/* 6. Footer signature cluster */}
      <footer className="bg-[#FFF9F4] border-t border-[#D8C8F0]/30 pt-16 pb-8 text-xs text-[#3c305a]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Logo brand section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-tr from-[#D8C8F0] via-[#F8D7DA] to-[#FFD6C2] rounded-full flex items-center justify-center text-xs font-bold shadow-inner">
                N
              </div>
              <div>
                <h4 className="font-serif tracking-widest font-extrabold text-sm">NIVEHA</h4>
                <p className="text-[8px] tracking-wider uppercase opacity-80 mt-0.5">Style Crafted for Every You.</p>
              </div>
            </div>
            <p className="text-gray-500 leading-relaxed text-[11px] text-justify">
              At Niveha, we integrate the spectacular pen kalamkari vegetable dye aesthetics of rural Andhra Pradesh with modern accessory forms, bringing affordable premium luxury directly to your wardrobe.
            </p>
          </div>

          {/* Quick links */}
          <div className="space-y-3">
            <h5 className="font-bold text-gray-700 uppercase tracking-widest text-[10px]">Studio Collections</h5>
            <ul className="space-y-1.5 text-gray-500">
              <li><button onClick={() => { setSelectedCategory("Handbags"); setActiveTab("shop"); setSelectedProduct(null); }} className="hover:text-pink-700 transition-all text-left">Pen Kalamkari Handbags</button></li>
              <li><button onClick={() => { setSelectedCategory("Tote Bags"); setActiveTab("shop"); setSelectedProduct(null); }} className="hover:text-pink-700 transition-all text-left">Luxury Artisan Totes</button></li>
              <li><button onClick={() => { setSelectedCategory("Earrings"); setActiveTab("shop"); setSelectedProduct(null); }} className="hover:text-pink-700 transition-all text-left">Royal Kundan Jhumkas</button></li>
              <li><button onClick={() => { setSelectedCategory("Jewellery"); setActiveTab("shop"); setSelectedProduct(null); }} className="hover:text-pink-700 transition-all text-left">Temple Choker Jewellery</button></li>
              <li><button onClick={() => { setSelectedCategory("Women's Fashion"); setActiveTab("shop"); setSelectedProduct(null); }} className="hover:text-pink-700 transition-all text-left">Anarkali Kurtis & Saree</button></li>
            </ul>
          </div>

          {/* Business Address section */}
          <div className="space-y-3">
            <h5 className="font-bold text-gray-700 uppercase tracking-widest text-[10px]">Visakhapatnam Studio</h5>
            <ul className="space-y-2 text-gray-500 font-medium">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 shrink-0 text-pink-700" />
                <span>
                  Niveha Fashion Studio<br />
                  MVP Colony, Near Beach Road<br />
                  Visakhapatnam, Andhra Pradesh 530017
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-pink-700" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-pink-700" />
                <span>support@niveha.in</span>
              </li>
            </ul>
          </div>

          {/* Payment guarantees & Delivery Courier lists */}
          <div className="space-y-4">
            <div>
              <h5 className="font-bold text-gray-700 uppercase tracking-widest text-[10px] mb-2">Delivery Logistic Partners</h5>
              <div className="flex flex-wrap gap-1.5 text-[10px] text-gray-500 font-semibold">
                <span className="bg-white border px-2 py-0.5 rounded shadow-3xs">Delhivery</span>
                <span className="bg-white border px-2 py-0.5 rounded shadow-3xs">DTDC</span>
                <span className="bg-white border px-2 py-0.5 rounded shadow-3xs">Blue Dart</span>
                <span className="bg-white border px-2 py-0.5 rounded shadow-3xs">Ecom Express</span>
                <span className="bg-white border px-2 py-0.5 rounded shadow-3xs">India Post</span>
              </div>
            </div>

            <div>
              <h5 className="font-bold text-gray-700 uppercase tracking-widest text-[10px] mb-2">Checkout Security</h5>
              <div className="flex items-center gap-1.5 text-xs text-green-700 font-bold bg-green-50 w-max pl-2 pr-3 py-1 rounded border border-green-200">
                <ShieldCheck className="w-4 h-4 text-green-600" /> 100% Secure SSL Gateway
              </div>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 border-t border-gray-200 mt-12 pt-6 flex flex-col md:flex-row justify-between text-gray-400 text-[11px] font-medium">
          <span>© 2026 Niveha Fashion Studio. Made beautifully for Indian art & fashion lovers.</span>
          <span>Terms of Use • Privacy Guidelines • Visakhapatnam Heritage Registry</span>
        </div>
      </footer>

    </div>
  );
}
