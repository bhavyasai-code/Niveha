/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, Sparkles, Volume2, Mic, MicOff } from "lucide-react";

interface Message {
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
}

export default function NiviChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: "Namaste! 🙏 I am Nivi, your personal Niveha Stylist. How can I decorate your style journey today? (I assist in English, తెలుగు, & हिंदी)",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [language, setLanguage] = useState<"English" | "Telugu" | "Hindi">("English");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // Speech Recognition (Web Speech API)
  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser. Please try Chrome or Safari.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === "Telugu" ? "te-IN" : language === "Hindi" ? "hi-IN" : "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
      return;
    }

    setIsListening(true);
    recognition.start();

    recognition.onresult = (event: any) => {
      const speechToText = event.results[0][0].transcript;
      setInputValue(speechToText);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech Recognition Error", event);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue;
    setInputValue("");

    const newMsg: Message = {
      sender: "user",
      text: userText,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          language,
          // Extract last 6 messages to keep context lean
          history: updatedMessages.slice(-6).map((m) => ({
            sender: m.sender,
            text: m.text,
          })),
        }),
      });

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: data.text || "I am processing your style query beautifully.",
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Forgive me, my connection to the fashion studio was interrupted. Rest assured, your luxury experience remains our priority.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Convert text response to natural Indian English or regional voice using speech synthesis
  const speakResponse = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (language === "Telugu") {
      utterance.lang = "te-IN";
    } else if (language === "Hindi") {
      utterance.lang = "hi-IN";
    } else {
      utterance.lang = "en-IN";
    }
    window.speechSynthesis.speak(utterance);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        id="nivi-chatbot-toggle"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-[#D8C8F0] hover:bg-[#c9b7e7] text-[#4b3c63] p-4 rounded-full shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center border-2 border-[#FFF9F4]"
      >
        {isOpen ? <X className="w-6 h-6" /> : (
          <div className="relative">
            <MessageSquare className="w-6 h-6" />
            <span className="absolute -top-2 -right-2 flex h-3.3 w-3.3 bg-[#F8D7DA] rounded-full border border-white animate-pulse"></span>
          </div>
        )}
      </button>

      {/* Floating Interactive Chatbot Box */}
      {isOpen && (
        <div
          id="nivi-chatbot-box"
          className="fixed bottom-24 right-6 w-96 max-w-[90vw] h-[500px] z-50 bg-[#FFF9F4] rounded-2xl shadow-2xl flex flex-col border border-[#D8C8F0] overflow-hidden dynamic-enter transition-all duration-300 animate-slide-up"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#D8C8F0] via-[#F8D7DA] to-[#FFD6C2] p-4 text-[#4b3c63] flex items-center justify-between border-b border-[#D8C8F0]/30 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="bg-[#FFF9F4] p-1.5 rounded-full shadow-inner animate-pulse">
                <Bot className="w-5 h-5 text-[#4b3c63]" />
              </div>
              <div>
                <h4 className="font-semibold text-sm tracking-wide flex items-center gap-1">
                  Nivi AI Stylist <Sparkles className="w-3.5 h-3.5 text-[#e1b54b] fill-[#e1b54b]" />
                </h4>
                <p className="text-[10px] opacity-80">Available in EN • తెలుగు • हिंदी</p>
              </div>
            </div>
            {/* Language Switcher */}
            <div className="flex gap-1 bg-[#FFF9F4]/70 p-0.5 rounded-lg border border-[#D8C8F0]/40">
              {(["English", "Telugu", "Hindi"] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`text-[9px] px-2 py-1 rounded-md font-medium transition-all ${
                    language === lang
                      ? "bg-[#D8C8F0] text-[#4b3c63] shadow-sm font-bold"
                      : "text-[#4b3c63]/70 hover:bg-[#FFF9F4]/40"
                  }`}
                >
                  {lang === "Telugu" ? "తెలుగు" : lang === "Hindi" ? "हिंदी" : "EN"}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Style Tags */}
          <div className="bg-[#FFF9F4] px-4 py-2 flex gap-2 overflow-x-auto whitespace-nowrap border-b border-[#D8C8F0]/10 scrollbar-none">
            {[
              "Kalamkari Bags Under ₹1999",
              "Traditional earrings and Jhumkas",
              "Suggest a festival outfit pairing",
              "Visakhapatnam studio address"
            ].map((tag, i) => (
              <button
                key={i}
                onClick={() => {
                  setInputValue(tag);
                }}
                className="text-[10px] bg-[#D8C8F0]/20 hover:bg-[#D8C8F0]/40 text-[#4b3c63] px-2.5 py-1 rounded-full border border-[#D8C8F0]/30 transition-all cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Chat message body list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gradient-to-b from-[#FFF9F4] to-white">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.sender === "bot" && (
                  <div className="w-7 h-7 rounded-full bg-[#D8C8F0] text-[#4b3c63] flex items-center justify-center text-xs mt-0.5 border shadow-sm">
                    N
                  </div>
                )}
                <div className="relative group max-w-[75%]">
                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed shadow-sm ${
                      m.sender === "user"
                        ? "bg-[#D8C8F0] text-[#4b3c63] rounded-tr-none"
                        : "bg-[#FFF9F4] text-[#3c305a] border border-[#D8C8F0]/40 rounded-tl-none"
                    }`}
                  >
                    {m.text}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] text-gray-400">
                      {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {m.sender === "bot" && (
                      <button
                        onClick={() => speakResponse(m.text)}
                        title="Read aloud"
                        className="text-[10px] text-[#4b3c63] opacity-0 group-hover:opacity-100 hover:text-black transition-all flex items-center gap-0.5"
                      >
                        <Volume2 className="w-3 h-3 cursor-pointer" /> Listen
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-full bg-[#D8C8F0] text-[#4b3c63] flex items-center justify-center text-xs border animate-pulse">
                  N
                </div>
                <div className="p-3 bg-[#FFF9F4] border border-[#D8C8F0]/40 rounded-2xl rounded-tl-none flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 bg-[#4b3c63] rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-[#4b3c63] rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-[#4b3c63] rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Form Input */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 border-t border-[#D8C8F0]/20 bg-[#FFF9F4] flex items-center gap-2"
          >
            <button
              type="button"
              onClick={handleVoiceInput}
              className={`p-2 rounded-full transition-all flex items-center justify-center ${
                isListening
                  ? "bg-red-100 text-red-600 animate-pulse border border-red-300"
                  : "hover:bg-[#D8C8F0]/20 text-[#4b3c63]"
              }`}
              title={isListening ? "Listening..." : "Voice input style quest"}
            >
              {isListening ? <MicOff className="w-4.5 h-4.5" /> : <Mic className="w-4.5 h-4.5" />}
            </button>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask Nivi about bags, jewelry, sizing..."
              className="flex-1 bg-white border border-[#D8C8F0]/40 focus:outline-none focus:border-[#4b3c63] rounded-xl px-3.5 py-2 text-xs text-[#3c305a]"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="bg-[#D8C8F0] hover:bg-[#c9b7e7] text-[#4b3c63] p-2 rounded-xl transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
