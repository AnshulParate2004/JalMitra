import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Bot, User, Mic, MicOff, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { fetchAlerts, Alert, API_BASE_URL } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const Chatbot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your water quality assistant. I can help you understand alerts, provide recommendations, and answer questions about water quality. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize Azure Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const userInput = input;
    setInput("");
    setIsLoading(true);

    // Create placeholder for streaming response
    const assistantMessageId = Date.now().toString();
    const assistantMessage: Message = {
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      // Fetch recent alerts for context
      let alerts: Alert[] = [];
      try {
        alerts = await fetchAlerts(5);
      } catch (alertError) {
        console.warn("Could not fetch alerts, continuing without them:", alertError);
      }

      const apiUrl = `${API_BASE_URL}/api/chatbot/stream`;
      console.log(`[Chatbot] Connecting to: ${apiUrl}`);

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userInput,
          alerts: alerts,
          session_id: "default",
        }),
      });

      if (!response.ok) {
        // If streaming fails, try non-streaming endpoint
        const errorText = await response.text().catch(() => response.statusText);
        console.log(`Streaming failed (${response.status}): ${errorText}, trying non-streaming endpoint...`);
        const fallbackUrl = `${API_BASE_URL}/api/chatbot`;
        const fallbackResponse = await fetch(fallbackUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: userInput,
            alerts: alerts,
            session_id: "default",
          }),
        });
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          setMessages((prev) => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage && lastMessage.role === "assistant") {
              lastMessage.content = fallbackData.response || "Response received.";
            }
            return newMessages;
          });
          setIsLoading(false);
          return;
        }
        
        // Both endpoints failed, get error details
        let fallbackErrorText = fallbackResponse.statusText;
        try {
          const errorJson = await fallbackResponse.json();
          fallbackErrorText = errorJson.detail || errorJson.message || fallbackErrorText;
        } catch {
          fallbackErrorText = await fallbackResponse.text().catch(() => fallbackResponse.statusText);
        }
        console.error(`Both endpoints failed. Streaming: ${response.status} ${errorText}, Fallback: ${fallbackResponse.status} ${fallbackErrorText}`);
        throw new Error(`Backend error (${fallbackResponse.status}): ${fallbackErrorText || fallbackResponse.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = "";

      if (reader) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6).trim();
                if (data === "[DONE]") {
                  break;
                }
                
                if (data) {
                  accumulatedContent += data;

                  // Update the last message with accumulated content
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];
                    if (lastMessage && lastMessage.role === "assistant") {
                      lastMessage.content = accumulatedContent;
                    }
                    return newMessages;
                  });
                }
              }
            }
          }
        } catch (streamError) {
          console.error("Streaming error:", streamError);
          // Fallback to non-streaming endpoint
          try {
            const fallbackUrl = `${API_BASE_URL}/api/chatbot`;
            const fallbackResponse = await fetch(fallbackUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                message: userInput,
                alerts: alerts,
                session_id: "default",
              }),
            });
            
            if (fallbackResponse.ok) {
              const fallbackData = await fallbackResponse.json();
              setMessages((prev) => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage && lastMessage.role === "assistant") {
                  lastMessage.content = fallbackData.response || "Response received.";
                }
                return newMessages;
              });
            }
          } catch (fallbackError) {
            console.error("Fallback also failed:", fallbackError);
          }
        }
      }
    } catch (error) {
      console.error("Chatbot error:", error);
      let errorMessage = "Sorry, I'm having trouble connecting. Please try again later.";
      
      // Provide more specific error messages
      if (error instanceof TypeError && error.message.includes("fetch")) {
        errorMessage = "Unable to connect to the backend server. Please make sure the backend is running on port 8000.";
      } else if (error instanceof Error) {
        // Check if it's a network error or backend error
        if (error.message.includes("Backend error")) {
          errorMessage = error.message;
        } else if (error.message.includes("Failed to get response")) {
          errorMessage = "The backend server responded with an error. Please check the backend logs for details. This might be due to missing Azure OpenAI configuration.";
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      }
      
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage && lastMessage.role === "assistant") {
          lastMessage.content = errorMessage;
        }
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-background bg-grid flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-4 md:p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg border-2 border-black bg-primary flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Bot className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Water Quality Assistant</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Ask me about water quality alerts, get recommendations, or learn about water safety.
          </p>
        </motion.div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-lg border-2 border-black bg-primary/10 flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}
              <div
                className={`nba-card-sm max-w-[80%] ${
                  msg.role === "user" ? "bg-primary text-primary-foreground" : ""
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {msg.timestamp.toLocaleTimeString()}
                </p>
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-lg border-2 border-black bg-muted flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <User className="w-4 h-4 text-foreground" />
                </div>
              )}
            </motion.div>
          ))}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3 justify-start"
            >
              <div className="w-8 h-8 rounded-lg border-2 border-black bg-primary/10 flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="nba-card-sm">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="nba-card"
        >
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about water quality, alerts, or get recommendations..."
              className="flex-1 bg-transparent border-none outline-none resize-none text-foreground placeholder:text-muted-foreground"
              rows={2}
            />
            <div className="flex gap-2">
              <button
                onClick={toggleListening}
                className={`w-10 h-10 rounded-lg border-2 border-black flex items-center justify-center transition-all ${
                  isListening
                    ? "bg-destructive text-destructive-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                }`}
                title={isListening ? "Stop listening" : "Start voice input"}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 rounded-lg border-2 border-black bg-primary text-primary-foreground flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Chatbot;
