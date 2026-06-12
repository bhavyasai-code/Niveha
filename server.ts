/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { productsData } from "./src/data/products";

dotenv.config();

const app = express();
const PORT = 3000;

// Enable JSON parse middle-ware
app.use(express.json());

// Initialize server-side Gemini client securely
let ai: GoogleGenAI | null = null;

try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Server side Gemini client initialized successfully.");
  } else {
    console.warn("GEMINI_API_KEY secret not found. Nivi AI will operate with standard smart assistant simulation.");
  }
} catch (err) {
  console.error("Failed to initialize server-side Gemini client:", err);
}

// In-Memory Database for store feedback & simulated orders (to support persistent feedback system)
const feedbackDb: any[] = [];
const ordersDb: any[] = [];

// API - Get Products list
app.get("/api/products", (req, res) => {
  res.json(productsData);
});

// API - Nivi AI Chat endpoint
app.post("/api/chat", async (req, res) => {
  const { message, history = [], language = "English" } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  // Fallback assistant logic if API Key is not set or client fails
  const getSimulatedResponse = (msg: string) => {
    const lMsg = msg.toLowerCase();
    let text = "";
    
    if (lMsg.includes("telugu") || language === "Telugu") {
      text = "నమస్కారం! నేను నివి AI ఫ్యాషన్ అసిస్టెంట్. నేను మీకు ఎలా సహాయపడగలను? మా దగ్గర అందమైన పెన్ కలంకారి హ్యాండ్‌బ్యాగులు మరియు సంప్రదాయ జుంకాలు ఉన్నాయి.";
      if (lMsg.includes("bag") || lMsg.includes("సంచి")) {
        text += " మా 'Kalamkari Heritage Royal Tote' (₹1899) అద్భుతమైన ఆంధ్ర ప్రదేశ్ హస్తకళను ప్రతిబింబిస్తుంది. షాప్ లో చూడండి!";
      }
    } else if (lMsg.includes("hindi") || language === "Hindi") {
      text = "नमस्ते! मैं निवि एआई फैशन सहायक हूँ। मैं आपकी क्या सेवा कर सकती हूँ? हमारे पास बेहतरीन प्राचीन कलमकारी बैग और सुंदर झुमके उपलब्ध हैं।";
      if (lMsg.includes("bag") || lMsg.includes("थैला")) {
        text += " हमारा 'Kalamkari Heritage Royal Tote' (₹1899) सबसे लोकप्रिय हस्तनिर्मित बैग है। जरूर आज़माएं!";
      }
    } else {
      text = "Hello! I am Nivi, your premium Niveha Fashion Stylist. ";
      if (lMsg.includes("kalamkari") || lMsg.includes("handbag") || lMsg.includes("bag")) {
        text += "Ah, Kalamkari are our absolute signature masterpieces! I highly recommend the 'Kalamkari Heritage Royal Tote' (₹1899). Made with organic vegetable dyes and Srikalahasti heritage, it represents Andhra's finest workmanship. Would you like to try it on in our virtual fitting room?";
      } else if (lMsg.includes("earring") || lMsg.includes("jhumka") || lMsg.includes("jewelry")) {
        text += "Our 'Royal Peacock Kundan Jhumkas' (₹1199) look spectacular for festive occasions. You can try them on live right now using your webcam on the product details page!";
      } else if (lMsg.includes("recommend") || lMsg.includes("suggest")) {
        text += "Based on current Indian style trends, I suggest pairing our 'Peach Floral Kalamkari Anarkali Kurtis' with the 'Kalamkari Heritage Royal Tote' and our handcrafted 'Royal Peacock Kundan Jhumkas' for an elegant, synchronized Indian boutique look.";
      } else {
        text += "Niveha offers an authentic range of Kalamkari Bags, traditional Jhumkas, necklaces, sandals, and beautiful hand-woven kurtis. Let me know if you would like me to match a specific outfit or recommend a price-specific option!";
      }
    }
    return { text };
  };

  if (!ai) {
    return res.json(getSimulatedResponse(message));
  }

  try {
    // Generate context summary about our products so the model actually knows what is in the Niveha store!
    const storeProductsContext = productsData.map(p => 
      `- [${p.id}] "${p.name}" in category "${p.category}" costs ₹${p.price} (original ₹${p.originalPrice}), Rating: ${p.rating}/5. Material: ${p.material}. Description: ${p.description}`
    ).join("\n");

    const systemInstruction = `
You are Nivi, the highly sophisticated AI Fashion Assistant & Fashion Stylist for "Niveha", an luxury Indian online boutique and accessories brand.
Brand Info:
- Name: Niveha
- Tagline: Style Crafted for Every You
- Signature: Kalamkari Handbags, Jhumkas, temple jewelry, shoes, and luxury traditional/modern apparel.
- Address: MVP Colony, Near Beach Road, Visakhapatnam, Andhra Pradesh, India.
- Language Support: English, Telugu (తెలుగు), Hindi (हिंदी).
- Tone: Extremely elegant, premium, polite, culturally knowledgeable, and Indian boutique-centered.

Products In-Store Context:
${storeProductsContext}

Instruction Guidelines:
1. Always suggest real products from our database context above when appropriate. Mention their price (in INR, with ₹ symbol) and what makes them unique.
2. If the user asks in Telugu or Hindi, respond elegantly in that language using authentic terms. Speak warmly.
3. Keep answers concise, fashionable, helpful, and luxury boutique style (1-4 elegant sentences). 
4. Guide users to use our premium Live Virtual Try-On feature on the shop pages to overlay earrings, necklaces, and preview styles instantly.
`;

    const contents = [];
    
    // Process history
    for (const item of history) {
      if (item.sender === "user") {
        contents.push({ role: "user", parts: [{ text: item.text }] });
      } else if (item.sender === "bot") {
        contents.push({ role: "model", parts: [{ text: item.text }] });
      }
    }
    
    // Add current message
    contents.push({ role: "user", parts: [{ text: `[Language Context: ${language}] User message: ${message}` }] });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({ text: response.text || "I am here to guide your style journey at Niveha." });
  } catch (error) {
    console.error("Gemini API server failure, running backup model simulation:", error);
    res.json(getSimulatedResponse(message));
  }
});

// API - Save Order
app.post("/api/orders", (req, res) => {
  const { order } = req.body;
  if (!order) {
    return res.status(400).json({ error: "Order details required" });
  }
  const newOrder = {
    ...order,
    id: `NIV-${Math.floor(100000 + Math.random() * 900000)}`,
    timestamp: new Date().toISOString()
  };
  ordersDb.push(newOrder);
  res.json({ success: true, order: newOrder });
});

// API - Get orders list
app.get("/api/orders", (req, res) => {
  res.json(ordersDb);
});

// API - Save Feedback
app.post("/api/feedback", (req, res) => {
  const { feedback } = req.body;
  if (!feedback) {
    return res.status(400).json({ error: "Feedback required" });
  }
  const newFeedback = {
    ...feedback,
    id: `FB-${Math.floor(1000 + Math.random() * 9000)}`,
    timestamp: new Date().toISOString()
  };
  feedbackDb.push(newFeedback);
  res.json({ success: true, feedback: newFeedback });
});

// API - Get Feedbacks list
app.get("/api/feedback", (req, res) => {
  res.json(feedbackDb);
});


// Dev vs Production Setup
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    // Dynamically import Vite in development to bind HMR & bundler correctly
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware mounted.");
  } else {
    // Serve static frontend files in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static files serving enabled.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Niveha Premium E-Commerce Server running on http://localhost:${PORT}`);
  });
};

startServer().catch((err) => {
  console.error("Critical server boot error:", err);
});
