import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, X, Send, Bot, User } from "lucide-react";
import { Button } from "./ui/button";
import { dashboardService } from "../../services/dashboard.service";

export function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "bot", content: "Hello! I am the GovOps AI Assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSend = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { role: "user", content: input }]);
    const nextInput = input;
    setInput("");
    setIsSending(true);

    try {
      const result = await dashboardService.analyzeComplaint(nextInput);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: result.unavailable
            ? `Model service is unavailable: ${result.error}`
            : `I classified that as ${result.category} with ${result.priority} priority and ${Number(result.confidence || 0).toFixed(1)}% confidence.`,
        },
      ]);
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: "Sorry, I encountered an error processing your message.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }, [input]);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-6 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col h-[500px]"
          >
            {/* Header */}
            <div className="bg-blue-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">GovOps Assistant</h3>
                  <p className="text-blue-100 text-xs">AI is online</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 p-1 rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 p-4 overflow-y-auto bg-slate-50 dark:bg-slate-950 space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === "user" ? "bg-slate-200 dark:bg-slate-800" : "bg-blue-100 dark:bg-blue-900/50"}`}>
                    {msg.role === "user" ? <User className="w-4 h-4 text-slate-600 dark:text-slate-400" /> : <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                  </div>
                  <div className={`p-3 rounded-2xl max-w-[80%] text-sm ${msg.role === "user" ? "bg-blue-600 text-white rounded-tr-sm" : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm"}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-full px-4 text-sm focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
              />
              <Button type="submit" size="icon" className="rounded-full w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white shrink-0">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center z-50"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </motion.button>
    </>
  );
}
