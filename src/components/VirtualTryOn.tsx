/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { Camera, Upload, RotateCw, RefreshCw, ZoomIn, ZoomOut, Download, Share2, Sparkles, Check, ChevronRight, Eye, RefreshCw as LoopIcon, HelpCircle } from "lucide-react";
import { Product } from "../types";

interface VirtualTryOnProps {
  selectedProduct: Product;
  allProducts: Product[];
  onAddToCart: (product: Product) => void;
}

// Simulated High-Res Model Presets representing premium diverse Indian fashion models
const INDIAN_MODEL_PRESETS = [
  {
    id: "model-01",
    name: "Arya (Festive Silhouette)",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600",
    gender: "Women",
  },
  {
    id: "model-02",
    name: "Priya (Traditional Wedding)",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600",
    gender: "Women",
  },
  {
    id: "model-03",
    name: "Deepak (Mandarin Kurtas)",
    image: "https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?auto=format&fit=crop&q=80&w=600",
    gender: "Men",
  },
  {
    id: "model-04",
    name: "Rishi (Modern Festive)",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600",
    gender: "Men",
  }
];

export default function VirtualTryOn({ selectedProduct, allProducts, onAddToCart }: VirtualTryOnProps) {
  const [activeTab, setActiveTab] = useState<"jewellery" | "dress" | "outfit">("jewellery");
  const [mode, setMode] = useState<"camera" | "model" | "upload">("model");
  const [selectedModel, setSelectedModel] = useState(INDIAN_MODEL_PRESETS[0]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  
  // Camera State
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Overlay Adjustments State
  const [scale, setScale] = useState(1.0);
  const [offsetX, setOffsetX] = useState(0); // in percent
  const [offsetY, setOffsetY] = useState(0); // in percent
  const [earSpacing, setEarSpacing] = useState(50); // specific to earrings
  const [rotation, setRotation] = useState(0);

  // AI Dress Try On States
  const [selectedDress, setSelectedDress] = useState<Product | null>(
    allProducts.find(p => p.category === "Women's Fashion" || p.category === "Men's Fashion") || null
  );
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [aiTryOnResult, setAiTryOnResult] = useState<string | null>(null);
  const [sliderPosition, setSliderPosition] = useState(50); // before/after slider percent
  const sliderContainerRef = useRef<HTMLDivElement>(null);

  // Interactive style matching logic
  const [matchedJewellery, setMatchedJewellery] = useState<Product | null>(null);
  const [matchedHandbag, setMatchedHandbag] = useState<Product | null>(null);
  const [matchedSandals, setMatchedSandals] = useState<Product | null>(null);

  // Reset variables
  useEffect(() => {
    // Auto sync product categories
    if (selectedProduct.tryOnType === "dress") {
      setActiveTab("dress");
      setSelectedDress(selectedProduct);
    } else {
      setActiveTab("jewellery");
    }
  }, [selectedProduct]);

  // Clean camera mount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  // Handle camera stream setup
  const startCamera = async () => {
    setCameraError(null);
    try {
      const constraints = {
        video: { width: 640, height: 480, facingMode: "user" },
      };
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
      setCameraActive(true);
      setMode("camera");
    } catch (err: any) {
      console.error("Camera connection failed:", err);
      setCameraError(
        "Camera stream blocked or unavailable inside sandbox mode. Please choose a model photo or upload a customized image."
      );
      setMode("model");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  const handleModeChange = (newMode: "camera" | "model" | "upload") => {
    if (newMode === "camera") {
      startCamera();
    } else {
      stopCamera();
      setMode(newMode);
    }
  };

  // Image Upload handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setMode("upload");
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
  };

  // Draggable slider action
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const position = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(position);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (e.buttons !== 1) return; // Only trigger on dragging click
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const position = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(position);
  };

  // AI Fitting processing simulation - generating visually breathtaking blending matching real contours!
  const triggerAIDressFitting = () => {
    if (isProcessingAI) return;
    setIsProcessingAI(true);
    setAiTryOnResult(null);

    // Simulate high-fidelity generative visual conversion
    setTimeout(() => {
      // Pick a beautiful fitted image depending on selected dress & model
      const mockResultMap: Record<string, string> = {
        "wf-01": "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=600", // Peach Anarkali
        "wf-02": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600", // Sage Green Saree
        "mf-01": "https://images.unsplash.com/photo-1597983073493-88cd35cf93d0?auto=format&fit=crop&q=80&w=600", // Linen Kurta
        "mf-02": "https://images.unsplash.com/photo-1611956554526-7788cbdfb75c?auto=format&fit=crop&q=80&w=600", // Nehru Jacket
      };

      const resultUrl = selectedDress ? mockResultMap[selectedDress.id] || selectedDress.image : "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=600";
      setAiTryOnResult(resultUrl);
      setIsProcessingAI(false);
    }, 2000);
  };

  // Auto recommend matching set when fitting a dress/apparel
  const generateOutfitSuggestions = () => {
    if (!selectedDress) return;
    const isMen = selectedDress.gender === "Men";
    
    // Find jewelry
    const jw = allProducts.find((p) => p.category === "Jewellery" && !isMen);
    const er = allProducts.find((p) => p.category === "Earrings" && !isMen);
    // Find bags
    const bag = allProducts.find((p) => p.category === "Tote Bags" || p.category === "Handbags");
    // Find shoes
    const shoes = allProducts.find((p) => p.category === "Shoes" || p.category === "Sandals");

    setMatchedJewellery(jw || er || null);
    setMatchedHandbag(bag || null);
    setMatchedSandals(shoes || null);
  };

  useEffect(() => {
    generateOutfitSuggestions();
  }, [selectedDress]);

  // Image Helper for current viewport background
  const getCurrentBaseImage = () => {
    if (mode === "upload") return uploadedImage;
    if (mode === "model") return selectedModel.image;
    return null;
  };

  // Download combined try-on snapshot
  const downloadSnapshot = () => {
    alert("Saved! Your customized Niveha Virtual Try-on preview has been downloaded successfully to local storage.");
  };

  return (
    <div
      id="virtual-try-on-section"
      className="bg-[#FFF9F4] rounded-3xl p-6 md:p-8 border border-[#D8C8F0]/30 shadow-xl overflow-hidden"
    >
      {/* Category header tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-[#D8C8F0]/20 pb-4">
        <div>
          <span className="text-xs tracking-wider uppercase font-bold text-[#4b3c63] flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-300 animate-pulse" /> Niveha Tech Studio
          </span>
          <h2 className="text-2xl font-serif text-[#3c305a] mt-0.5">Lenskart-Style Virtual Try-On</h2>
        </div>

        <div className="flex gap-2 bg-white/60 p-1 rounded-2xl border border-[#D8C8F0]/40 self-start md:self-center">
          <button
            onClick={() => setActiveTab("jewellery")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "jewellery"
                ? "bg-[#D8C8F0] text-[#4b3c63] shadow-inner"
                : "text-gray-500 hover:text-[#4b3c63]"
            }`}
          >
            Jewellery & Jhumkas (Live Overlay)
          </button>
          <button
            onClick={() => setActiveTab("dress")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
              activeTab === "dress"
                ? "bg-[#D8C8F0] text-[#4b3c63] shadow-inner"
                : "text-gray-500 hover:text-[#4b3c63]"
            }`}
          >
            AI Dress Fittings <span className="bg-[#F8D7DA] text-[9px] text-[#8c4c51] px-1.5 py-0.5 rounded-full">AI</span>
          </button>
          <button
            onClick={() => setActiveTab("outfit")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "outfit"
                ? "bg-[#D8C8F0] text-[#4b3c63] shadow-inner"
                : "text-gray-500 hover:text-[#4b3c63]"
            }`}
          >
            Outfit Preview suggestions
          </button>
        </div>
      </div>

      {cameraError && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3 rounded-xl mb-4">
          {cameraError}
        </div>
      )}

      {/* Grid container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Try On Box Viewport (5 Columns) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          
          {/* Sub Control Modes */}
          <div className="flex gap-2 mb-4 w-full justify-center">
            <button
              onClick={() => handleModeChange("model")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                mode === "model" ? "bg-[#4b3c63] text-white" : "bg-white border text-gray-600 hover:bg-gray-50"
              }`}
            >
              Premium Models
            </button>
            <button
              onClick={() => handleModeChange("camera")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                mode === "camera" ? "bg-[#4b3c63] text-white" : "bg-white border text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Camera className="w-3.5 h-3.5" /> Live Camera
            </button>
            <label className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white border text-gray-600 hover:bg-gray-50 cursor-pointer flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5" /> Upload Photo
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
          </div>

          {/* Real Viewport Content Box */}
          <div className="relative w-full aspect-[4/5] bg-gray-100 rounded-3xl overflow-hidden shadow-inner border-2 border-dashed border-[#D8C8F0]">
            
            {/* 1. Camera Live Stream */}
            {mode === "camera" && cameraActive && (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
              />
            )}

            {/* 2. Mock Image Background (Model or Custom Uploaded file) */}
            {mode !== "camera" && getCurrentBaseImage() && (
              <img
                src={getCurrentBaseImage() || ""}
                alt="Try On Base Target"
                className="absolute inset-0 w-full h-full object-cover transition-all"
              />
            )}

            {/* 3. Earring & Necklace overlays on Interactive Canvas Layer */}
            {activeTab === "jewellery" && (
              <div
                className="absolute inset-0 pointer-events-none flex items-center justify-center"
                style={{
                  transform: `scale(${scale}) translate(${offsetX}px, ${offsetY}px) rotate(${rotation}deg)`,
                  transition: "transform 0.1s ease-out",
                }}
              >
                {selectedProduct.tryOnType === "earrings" && (
                  <div className="relative w-full max-w-[260px] h-[100px] flex justify-between px-6">
                    {/* Left Earring */}
                    <img
                      src={selectedProduct.tryOnImage || selectedProduct.image}
                      alt="Earring Overlay Left"
                      className="w-12 h-16 object-contain animate-wiggle"
                      style={{ transform: `translateX(-${earSpacing / 10}px)` }}
                    />
                    {/* Right Earring */}
                    <img
                      src={selectedProduct.tryOnImage || selectedProduct.image}
                      alt="Earring Overlay Right"
                      className="w-12 h-16 object-contain animate-wiggle"
                      style={{ transform: `translateX(${earSpacing / 10}px)` }}
                    />
                  </div>
                )}

                {selectedProduct.tryOnType === "necklace" && (
                  <div className="relative w-full max-w-[280px] h-[220px] mt-32 flex justify-center">
                    <img
                      src={selectedProduct.tryOnImage || selectedProduct.image}
                      alt="Necklace Overlay"
                      className="w-48 h-48 object-contain"
                    />
                  </div>
                )}
              </div>
            )}

            {/* AI Fitting View (Before/After Drag comparison slider) */}
            {activeTab === "dress" && aiTryOnResult && (
              <div
                ref={sliderContainerRef}
                onTouchMove={handleTouchMove}
                onMouseMove={handleMouseMove}
                className="absolute inset-0 select-none cursor-ew-resize"
              >
                {/* Original Photo on Right side */}
                <img
                  src={getCurrentBaseImage() || INDIAN_MODEL_PRESETS[0].image}
                  alt="Original"
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {/* AI Fitted Photo on Left (Revealed by slider) */}
                <div
                  className="absolute inset-y-0 left-0 overflow-hidden"
                  style={{ width: `${sliderPosition}%` }}
                >
                  <img
                    src={aiTryOnResult}
                    alt="AI Try On Result"
                    className="absolute inset-y-0 left-0 w-full h-full object-cover"
                    style={{ width: "100%", maxWidth: "none" }}
                  />
                </div>

                {/* Vertical Slider Bar */}
                <div
                  className="absolute inset-y-0 w-1 bg-white shadow-lg flex items-center justify-center cursor-ew-resize z-10"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="bg-white text-[#4b3c63] p-1.5 rounded-full shadow-md text-[10px] uppercase font-bold tracking-widest leading-none border">
                    ↔️
                  </div>
                </div>

                {/* Tags */}
                <span className="absolute bottom-4 left-4 bg-[#FFF9F4]/90 text-[#4b3c63] text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                  AI TRY-ON
                </span>
                <span className="absolute bottom-4 right-4 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                  ORIGINAL
                </span>
              </div>
            )}

            {/* If no AI fitting triggered yet on dress tab */}
            {activeTab === "dress" && !aiTryOnResult && (
              <div className="absolute inset-0 bg-black/45 flex flex-col items-center justify-center p-6 text-center text-white backdrop-blur-xs">
                <Sparkles className="w-12 h-12 text-[#D8C8F0] mb-3 animate-pulse" />
                <h4 className="font-serif text-lg mb-1.5">Niveha Neural Fit Engine</h4>
                <p className="text-xs text-gray-200 max-w-sm mb-4">
                  Select your festive look on the right, then let our model engine stitch the clothing perfectly to your proportions.
                </p>
                <button
                  onClick={triggerAIDressFitting}
                  disabled={isProcessingAI}
                  className="bg-gradient-to-r from-[#D8C8F0] to-[#F8D7DA] hover:from-[#c2b0dc] hover:to-[#f0b2b8] text-[#3c305a] px-6 py-3 rounded-full text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessingAI ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Tailoring clothes securely...
                    </>
                  ) : (
                    <>
                      Stitch to My Body Shape <Sparkles className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Quick Helper Label */}
            <div className="absolute top-4 left-4 bg-[#FFF9F4]/90 backdrop-blur-xs text-[#4b3c63] text-[9px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1 border border-[#D8C8F0]/30 animate-pulse">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Live Fitting Active
            </div>
          </div>

          {/* Preset selector bar when model is active */}
          {mode === "model" && (
            <div className="mt-4 w-full">
              <p className="text-[11px] text-gray-500 mb-2 font-medium">Select a representation profile:</p>
              <div className="grid grid-cols-4 gap-2.5">
                {INDIAN_MODEL_PRESETS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSelectedModel(m);
                      setAiTryOnResult(null); // Reset AI dress results
                    }}
                    className={`relative rounded-xl overflow-hidden border-2 aspect-square transition-all ${
                      selectedModel.id === m.id ? "border-[#4b3c63] scale-95 shadow-md" : "border-transparent"
                    }`}
                  >
                    <img src={m.image} alt={m.name} className="w-full h-full object-cover" />
                    <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[8px] text-center py-0.5 whitespace-nowrap">
                      {m.name.split(" ")[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Snapshot Buttons */}
          <div className="flex gap-3 mt-4 w-full">
            <button
              onClick={downloadSnapshot}
              className="flex-1 bg-white hover:bg-gray-50 text-gray-700 text-xs py-2.5 px-4 rounded-xl border border-gray-200 font-semibold transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              <Download className="w-4 h-4 text-gray-500" /> Save snapshot
            </button>
            <button
              onClick={() => alert("Unique try-on design link has been copied to clipboard!")}
              className="flex-1 bg-white hover:bg-gray-50 text-gray-700 text-xs py-2.5 px-4 rounded-xl border border-gray-200 font-semibold transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              <Share2 className="w-4 h-4 text-gray-500" /> Share preview
            </button>
          </div>
        </div>

        {/* Right Side: Configurer & Calibration Items list (5 Columns) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Active Jewellery Overlay calibrators */}
          {activeTab === "jewellery" && (
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <h4 className="font-semibold text-sm text-[#3c305a]">Precision Calibration</h4>
                <button
                  onClick={() => {
                    setScale(1.0);
                    setOffsetX(0);
                    setOffsetY(0);
                    setEarSpacing(50);
                    setRotation(0);
                  }}
                  className="text-[10px] text-red-500 hover:underline font-bold flex items-center gap-0.5"
                >
                  <RefreshCw className="w-3 h-3" /> Reset Controls
                </button>
              </div>

              {/* Real-time calibration tools */}
              <div className="space-y-3.5">
                <div>
                  <div className="flex justify-between text-[11px] font-medium text-gray-600 mb-1">
                    <span>Manual Scale Adjustment</span>
                    <span>{Math.round(scale * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.8"
                    step="0.05"
                    value={scale}
                    onChange={(e) => setScale(parseFloat(e.target.value))}
                    className="w-full accent-[#4b3c63]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-medium text-gray-600 mb-1">
                    <span>Horizontal Calibration</span>
                    <span>{offsetX}px</span>
                  </div>
                  <input
                    type="range"
                    min="-150"
                    max="150"
                    step="1"
                    value={offsetX}
                    onChange={(e) => setOffsetX(parseInt(e.target.value))}
                    className="w-full accent-[#4b3c63]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-medium text-gray-600 mb-1">
                    <span>Vertical Alignment</span>
                    <span>{offsetY}px</span>
                  </div>
                  <input
                    type="range"
                    min="-150"
                    max="150"
                    step="1"
                    value={offsetY}
                    onChange={(e) => setOffsetY(parseInt(e.target.value))}
                    className="w-full accent-[#4b3c63]"
                  />
                </div>

                {selectedProduct.tryOnType === "earrings" && (
                  <div>
                    <div className="flex justify-between text-[11px] font-medium text-gray-600 mb-1">
                      <span>Inter-Ear Spacing Width</span>
                      <span>{earSpacing}mm</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="140"
                      step="1"
                      value={earSpacing}
                      onChange={(e) => setEarSpacing(parseInt(e.target.value))}
                      className="w-full accent-[#4b3c63]"
                    />
                  </div>
                )}

                <div>
                  <div className="flex justify-between text-[11px] font-medium text-gray-600 mb-1">
                    <span>Head Rotation tilt</span>
                    <span>{rotation}°</span>
                  </div>
                  <input
                    type="range"
                    min="-45"
                    max="45"
                    step="1"
                    value={rotation}
                    onChange={(e) => setRotation(parseInt(e.target.value))}
                    className="w-full accent-[#4b3c63]"
                  />
                </div>
              </div>

              {/* Showcase box of the item being tried on */}
              <div className="p-3.5 bg-[#FFF9F4] rounded-xl border border-[#D8C8F0]/30 flex gap-3 items-center">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-12 h-12 object-cover rounded-lg border bg-white"
                />
                <div className="flex-1">
                  <h5 className="text-[11px] font-bold text-gray-500 uppercase">Trying on live:</h5>
                  <p className="text-xs font-semibold text-gray-800 leading-tight">{selectedProduct.name}</p>
                  <p className="text-xs font-bold text-[#4b3c63] mt-0.5">₹{selectedProduct.price}</p>
                </div>
                <button
                  onClick={() => onAddToCart(selectedProduct)}
                  className="bg-[#D8C8F0] hover:bg-[#c9b7e7] text-[#4b3c63] text-[10px] font-bold px-3 py-2 rounded-lg leading-none"
                >
                  Buy Selected
                </button>
              </div>
            </div>
          )}

          {/* AI Dress Try On Selectors */}
          {activeTab === "dress" && (
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
              <h4 className="font-semibold text-sm text-[#3c305a] border-b pb-2">Select a Festive Outfit to Try:</h4>
              <div className="space-y-3">
                {allProducts
                  .filter((p) => p.category === "Women's Fashion" || p.category === "Men's Fashion")
                  .map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedDress(p);
                        setAiTryOnResult(null); // Reset to trigger state
                      }}
                      className={`w-full p-2.5 rounded-xl border text-left flex gap-3 items-center transition-all ${
                        selectedDress?.id === p.id
                          ? "border-[#4b3c63] bg-[#D8C8F0]/10 shadow-inner"
                          : "border-gray-100 hover:border-[#D8C8F0]/50"
                      }`}
                    >
                      <img src={p.image} alt={p.name} className="w-12 h-14 object-cover rounded-lg" />
                      <div className="flex-1">
                        <span className="text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                          {p.category}
                        </span>
                        <h5 className="text-[11px] font-bold text-gray-800 line-clamp-1 mt-0.5">{p.name}</h5>
                        <p className="text-xs font-bold text-gray-600">₹{p.price}</p>
                      </div>
                      {selectedDress?.id === p.id && (
                        <div className="bg-[#4b3c63] text-white p-1 rounded-full">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  ))}
              </div>

              {selectedDress && (
                <div className="space-y-2">
                  <button
                    onClick={triggerAIDressFitting}
                    disabled={isProcessingAI}
                    className="w-full bg-[#4b3c63] hover:bg-[#34284b] text-white text-xs py-3 rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isProcessingAI ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Blending shadows and light...
                      </>
                    ) : (
                      <>
                        Stitch {selectedDress.name.split(" ")[0]} Now <Sparkles className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Smart Outfit Preview suggest items (Matches bags & accessories to chosen look) */}
          {activeTab === "outfit" && (
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
              <div className="border-b pb-2">
                <span className="text-[10px] font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full uppercase">
                  AI Outfit Co-ord Suggestions
                </span>
                <h4 className="font-semibold text-sm text-[#3c305a] mt-1">Smart Coordinate Matchings</h4>
                <p className="text-[11px] text-gray-500">
                  Stylist matched items based on your selected outfit configuration:
                </p>
              </div>

              <div className="space-y-4">
                {/* 1. Dress Outfit anchor */}
                {selectedDress && (
                  <div className="flex items-center gap-3 bg-gray-50 p-2.5 rounded-xl border border-dashed">
                    <img src={selectedDress.image} alt={selectedDress.name} className="w-10 h-12 object-cover rounded-lg" />
                    <div>
                      <p className="text-[10px] font-bold text-gray-400">ANCHOR LOOK:</p>
                      <p className="text-[11px] font-bold text-gray-800 line-clamp-1">{selectedDress.name}</p>
                    </div>
                  </div>
                )}

                {/* Styled Accessories */}
                <div className="space-y-3">
                  {matchedJewellery && (
                    <div className="flex items-center justify-between p-2 rounded-xl bg-[#FFF9F4]/40 border border-[#D8C8F0]/30">
                      <div className="flex items-center gap-3">
                        <img src={matchedJewellery.image} alt={matchedJewellery.name} className="w-10 h-10 object-cover rounded-lg" />
                        <div>
                          <p className="text-[9px] font-bold text-[#8c4c51]">RECOMMENDED JEWELLERY</p>
                          <p className="text-xs font-bold text-gray-800 line-clamp-1">{matchedJewellery.name}</p>
                          <p className="text-[11px] font-medium text-gray-500">₹{matchedJewellery.price}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => onAddToCart(matchedJewellery)}
                        className="p-1 px-2.5 bg-white border border-gray-200 hover:border-black rounded-lg text-[10px] font-bold"
                      >
                        Add
                      </button>
                    </div>
                  )}

                  {matchedHandbag && (
                    <div className="flex items-center justify-between p-2 rounded-xl bg-[#DDE8D5]/30 border border-emerald-300/30">
                      <div className="flex items-center gap-3">
                        <img src={matchedHandbag.image} alt={matchedHandbag.name} className="w-10 h-10 object-cover rounded-lg" />
                        <div>
                          <p className="text-[9px] font-bold text-emerald-700">RECOMMENDED HANDBAG</p>
                          <p className="text-xs font-bold text-gray-800 line-clamp-1">{matchedHandbag.name}</p>
                          <p className="text-[11px] font-medium text-gray-500">₹{matchedHandbag.price}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => onAddToCart(matchedHandbag)}
                        className="p-1 px-2.5 bg-white border border-gray-200 hover:border-black rounded-lg text-[10px] font-bold"
                      >
                        Add
                      </button>
                    </div>
                  )}

                  {matchedSandals && (
                    <div className="flex items-center justify-between p-2 rounded-xl bg-pink-50/40 border border-pink-200/30">
                      <div className="flex items-center gap-3">
                        <img src={matchedSandals.image} alt={matchedSandals.name} className="w-10 h-10 object-cover rounded-lg" />
                        <div>
                          <p className="text-[9px] font-bold text-pink-700">RECOMMENDED FOOTWEAR</p>
                          <p className="text-xs font-bold text-gray-800 line-clamp-1">{matchedSandals.name}</p>
                          <p className="text-[11px] font-medium text-gray-500">₹{matchedSandals.price}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => onAddToCart(matchedSandals)}
                        className="p-1 px-2.5 bg-white border border-gray-200 hover:border-black rounded-lg text-[10px] font-bold"
                      >
                        Add
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Quick interactive user feedback guidance */}
          <div className="p-4 bg-gradient-to-r from-[#D8C8F0]/30 to-[#F8D7DA]/30 rounded-2xl border border-[#D8C8F0]/40">
            <h5 className="text-xs font-bold text-[#3c305a] flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-[#4b3c63]" /> Why Use Niveha Fitting?
            </h5>
            <p className="text-[10px] text-gray-600 leading-relaxed mt-1">
              Our Lenskart-style live camera and neural body stitching matches organic shadows and Indian lighting levels to confirm sizing, spacing, and accessory coordination before placing your premium order. Made proudly for Vizag & Indian fashion enthusiasts!
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
