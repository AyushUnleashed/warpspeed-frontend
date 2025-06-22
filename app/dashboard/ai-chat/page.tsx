// app/dashboard/ai-chat/page.tsx - This file should replace the empty one
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Send, Loader2, Check, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ChatMessage, TextMessage, ImageGridMessage } from "@/types";
import { editImage } from "@/utils/api";

export default function AIChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get project data from URL params
  const projectId = searchParams.get('projectId');
  const imagesParam = searchParams.get('images');
  
  // State management
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedDesignId, setSelectedDesignId] = useState<string | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize chat with generated images
  useEffect(() => {
    if (imagesParam) {
      try {
        const imageUrls = JSON.parse(decodeURIComponent(imagesParam)) as string[];
        
        // Add welcome message
        const welcomeMessage: TextMessage = {
          id: `msg-${Date.now()}`,
          type: 'text',
          content: "I've generated some creative product photography concepts for you! Click on any image below to select it, then tell me how you'd like to edit it.",
          sender: 'ai',
          timestamp: new Date()
        };

        // Add image grid message
        const imageGridMessage: ImageGridMessage = {
          id: `msg-${Date.now() + 1}`,
          type: 'image-grid',
          images: imageUrls,
          sender: 'ai',
          timestamp: new Date()
        };

        setMessages([welcomeMessage, imageGridMessage]);
      } catch (error) {
        console.error("Error parsing images:", error);
      }
    }
  }, [imagesParam]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle image selection
  const handleImageSelect = (imageUrl: string, messageId: string) => {
    // Generate a temporary design ID for this image
    const designId = `design-${Date.now()}`;
    setSelectedDesignId(designId);
    setSelectedImageUrl(imageUrl);

    // Update the message to show selection
    setMessages(prev => prev.map(msg => 
      msg.id === messageId && msg.type === 'image-grid'
        ? { ...msg, selectedImageIndex: msg.images.indexOf(imageUrl) }
        : msg
    ));

    // Add confirmation message
    const confirmationMessage: TextMessage = {
      id: `msg-${Date.now()}`,
      type: 'text',
      content: "Perfect! I've selected that image. Now tell me how you'd like to edit it - for example: 'change the background to a modern kitchen' or 'make the lighting more dramatic'.",
      sender: 'ai',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, confirmationMessage]);
    
    // Focus input
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Handle sending messages
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isProcessing) return;

    const userMessage: TextMessage = {
      id: `msg-${Date.now()}`,
      type: 'text',
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsProcessing(true);

    try {
      if (selectedDesignId && selectedImageUrl) {
        // User has selected an image, so this is an edit request
        const aiThinkingMessage: TextMessage = {
          id: `msg-${Date.now() + 1}`,
          type: 'text',
          content: "Let me edit that image for you...",
          sender: 'ai',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiThinkingMessage]);

        // Call edit image API
        const editedImageUrl = await editImage(selectedDesignId, inputMessage, selectedImageUrl);

        // Show the edited result
        const resultMessage: ImageGridMessage = {
          id: `msg-${Date.now() + 2}`,
          type: 'image-grid',
          images: [editedImageUrl],
          sender: 'ai',
          timestamp: new Date()
        };

        const followupMessage: TextMessage = {
          id: `msg-${Date.now() + 3}`,
          type: 'text',
          content: "Here's your edited image! You can select it and ask for more changes, or choose a different image from above to work with.",
          sender: 'ai',
          timestamp: new Date()
        };

        setMessages(prev => {
          // Remove the thinking message and add results
          const withoutThinking = prev.slice(0, -1);
          return [...withoutThinking, resultMessage, followupMessage];
        });

        // Update selected image to the new one
        setSelectedImageUrl(editedImageUrl);

      } else {
        // No image selected, ask user to select one
        const responseMessage: TextMessage = {
          id: `msg-${Date.now() + 1}`,
          type: 'text',
          content: "Please first select an image from above by clicking on it, then I can help you edit it!",
          sender: 'ai',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, responseMessage]);
      }
    } catch (error) {
      console.error("Error processing message:", error);
      const errorMessage: TextMessage = {
        id: `msg-${Date.now() + 1}`,
        type: 'text',
        content: "Sorry, I had trouble processing that request. Please try again.",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Render message components
  const renderMessage = (message: ChatMessage) => {
    if (message.type === 'text') {
      return (
        <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
          <div className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl px-4 py-2 rounded-lg ${
            message.sender === 'user' 
              ? 'bg-blue-600 text-white rounded-br-sm' 
              : 'bg-gray-100 text-gray-800 rounded-bl-sm'
          }`}>
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            <p className="text-xs opacity-70 mt-1">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      );
    }

    if (message.type === 'image-grid') {
      return (
        <div key={message.id} className="flex justify-start mb-4">
          <div className="max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              {message.images.map((imageUrl, index) => (
                <div 
                  key={index} 
                  className={`relative cursor-pointer transition-all duration-200 rounded-lg overflow-hidden ${
                    message.selectedImageIndex === index 
                      ? 'ring-4 ring-blue-500 scale-105' 
                      : 'hover:scale-102 hover:shadow-lg'
                  }`}
                  onClick={() => handleImageSelect(imageUrl, message.id)}
                >
                  <Image
                    src={imageUrl}
                    alt={`Generated design ${index + 1}`}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover"
                  />
                  {message.selectedImageIndex === index && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200" />
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2 px-2">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                Edit Product Images with AI
              </h1>
              <p className="text-sm text-gray-500">
                {selectedImageUrl ? 'Image selected - ready for editing' : 'Select an image to start editing'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="max-w-4xl mx-auto">
          {messages.map(renderMessage)}
          
          {/* Processing indicator */}
          {isProcessing && (
            <div className="flex justify-start mb-4">
              <div className="bg-gray-100 rounded-lg rounded-bl-sm px-4 py-2 flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
                <span className="text-sm text-gray-600">Processing...</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={selectedImageUrl 
                  ? "Describe how you'd like to edit the selected image..." 
                  : "Select an image first, then describe your edit..."
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isProcessing}
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isProcessing}
              className="px-6 py-3"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {selectedImageUrl && (
            <div className="mt-2 text-sm text-gray-500 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Image selected - ready for editing
            </div>
          )}
        </div>
      </div>
    </div>
  );
}