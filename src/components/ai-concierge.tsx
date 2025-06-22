"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { Bot, Send, X, Loader, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { getMealRecommendationAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import type { MealRecommendationOutput } from "@/ai/flows/meal-recommendation";

type Message = {
  role: "user" | "assistant";
  content: string | MealRecommendationOutput;
};

export default function AIConcierge() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isPending) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    
    startTransition(async () => {
      try {
        const response = await getMealRecommendationAction({ preferences: input });
        const assistantMessage: Message = { role: "assistant", content: response };
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        console.error("AI recommendation failed:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to get AI recommendation. Please try again.",
        });
        setMessages(prev => prev.slice(0, -1)); // Remove user message on failure
      }
    });

    setInput("");
  };

  return (
    <>
      <div className={cn(
          "fixed bottom-6 right-6 z-50 transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-96 opacity-0" : "translate-x-0 opacity-100"
        )}>
        <Button
          isIconOnly
          onClick={() => setIsOpen(true)}
          className="rounded-full w-16 h-16 bg-primary text-primary-foreground shadow-lg shadow-primary/50 hover:bg-primary/90 animate-pulse"
          aria-label="Open AI Concierge"
        >
          <Bot size={32} />
        </Button>
      </div>

      <div
        className={cn(
          "fixed bottom-6 right-6 z-50 w-[calc(100vw-3rem)] max-w-sm transition-all duration-300 ease-in-out",
          isOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-1/4 pointer-events-none"
        )}
      >
        <Card className="h-[70vh] flex flex-col bg-background/80 backdrop-blur-md border-primary/50 shadow-2xl shadow-primary/20">
          <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-border">
            <CardTitle className="font-headline text-lg flex items-center gap-2 text-primary">
              <Sparkles className="w-5 h-5" />
              AI Concierge
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8">
              <X size={20} />
            </Button>
          </CardHeader>
          <CardContent className="p-0 flex-grow overflow-hidden">
            <ScrollArea className="h-full" ref={scrollAreaRef}>
              <div className="p-4 space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex gap-3",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <Bot size={20} className="text-primary-foreground" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "rounded-lg p-3 max-w-xs",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary"
                      )}
                    >
                      {typeof message.content === "string" ? (
                        <p className="text-sm">{message.content}</p>
                      ) : (
                        <div className="space-y-2">
                           <p className="text-sm font-semibold">{message.content.mealName} from {message.content.restaurantName}</p>
                           <p className="text-sm text-muted-foreground">{message.content.description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                 {isPending && (
                    <div className="flex justify-start gap-3">
                         <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                            <Bot size={20} className="text-primary-foreground" />
                        </div>
                        <div className="bg-secondary p-3 rounded-lg flex items-center space-x-2">
                            <Loader size={16} className="animate-spin" />
                            <span className="text-sm text-muted-foreground">Finding recommendations...</span>
                        </div>
                    </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
          <div className="p-4 border-t border-border">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g., 'I want something spicy'"
                disabled={isPending}
                className="bg-input"
              />
              <Button type="submit" disabled={isPending || !input.trim()} className="bg-primary hover:bg-primary/90">
                {isPending ? <Loader size={20} className="animate-spin" /> : <Send size={20} />}
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </>
  );
}
