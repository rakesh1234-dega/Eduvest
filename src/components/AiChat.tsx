import { useState, useRef, useEffect } from "react";
import { Bot, Send, X, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { chatWithAssistant } from "@/utils/manual-assistant";
import { useLocation } from "react-router-dom";

export function AiChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const location = useLocation();
  const [messages, setMessages] = useState<{role: string, content: string}[]>([
    { role: "assistant", content: "Hi! I am your Smart Assistant. I can help guide you through the app, manage your budget, and plan your schedules! How can I help you today?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
       setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user" as const, content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Use the manual logic instead of real AI
      const aiResponse = await chatWithAssistant(userMessage.content, location.pathname);
      setMessages(prev => [...prev, { role: "assistant", content: aiResponse }]);
    } catch (error: any) {
      console.error(error);
      const errorMessage = "Error connecting to assistant service.";
      setMessages(prev => [...prev, { role: "assistant", content: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  const setShortcutText = (text: string) => {
    setInput(text);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-xl hover:bg-indigo-100 transition-colors focus:outline-none bg-indigo-50 border border-indigo-100 text-indigo-600 shadow-sm flex items-center justify-center">
          <Bot className="w-5 h-5" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="p-0 border-none shadow-xl w-[350px] sm:w-[400px] bg-card rounded-2xl overflow-hidden mt-2 flex flex-col h-[550px] z-[100]">
        <div className="px-5 py-4 border-b border-indigo-500 bg-indigo-600 flex items-center justify-between">
          <h3 className="font-bold text-white flex items-center gap-2">
            <Bot className="w-5 h-5" />
            Smart Assistant
          </h3>
          <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted">
          {messages.map((msg, i) => {
             const isUser = msg.role === "user";
             return (
               <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                 <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${isUser ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-card border border-border text-foreground rounded-tl-sm shadow-sm'}`}>
                    {msg.content}
                 </div>
               </div>
             )
          })}
          {isLoading && (
             <div className="flex justify-start">
                <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-2 shadow-sm text-indigo-500">
                   <Loader2 className="w-5 h-5 animate-spin" />
                </div>
             </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Quick action chips */}
        <div className="px-3 py-2 bg-card border-t border-border flex gap-2 overflow-x-auto scrollbar-none whitespace-nowrap">
          <button onClick={() => setShortcutText("How do I create a budget?")} className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-indigo-100 text-indigo-700 transition-colors border border-indigo-100">💰 Budget Help</button>
          <button onClick={() => setShortcutText("Give me a study schedule")} className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-indigo-100 text-indigo-700 transition-colors border border-indigo-100">📅 Schedule</button>
          <button onClick={() => setShortcutText("Where am I?")} className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-indigo-100 text-indigo-700 transition-colors border border-indigo-100">📍 Explain Page</button>
        </div>

        <form onSubmit={handleSend} className="p-3 bg-card flex gap-2 border-t border-border">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            className="flex-1 h-10 bg-muted border-none focus:ring-2 focus:ring-indigo-500 rounded-xl px-4 text-sm outline-none"
          />
          <button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="h-10 w-10 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl transition-colors shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </PopoverContent>
    </Popover>
  );
}
