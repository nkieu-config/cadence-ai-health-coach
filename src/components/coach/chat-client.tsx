"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { Trash2, Send, RefreshCw, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UserMessage, CoachMessage, PendingReply, QuotaReachedNotice } from "./message-variants";
import { sendCoachMessage, retryCoachReply, clearChatHistory } from "@/lib/chat/actions";
import {
  DAILY_MESSAGE_LIMIT,
  MESSAGE_MAX_LENGTH,
  needsReply,
  type ChatMessage,
} from "@/lib/chat/types";
const STARTERS = ["ช่วยดู pattern สัปดาห์นี้", "อยากตั้งเป้าสัปดาห์หน้า"];

interface CoachChatClientProps {
  initialMessages: ChatMessage[];
  initialQuotaLeft: number;
}

export function CoachChatClient({ initialMessages, initialQuotaLeft }: CoachChatClientProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [quotaLeft, setQuotaLeft] = useState<number>(initialQuotaLeft);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Transition state for server actions
  const [isPending, startTransition] = useTransition();

  // Scroll ref
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const tempIdRef = useRef(0);

  // Clear history double-confirm state
  const [confirmClear, setConfirmClear] = useState(false);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: "nearest" });
  };

  useEffect(() => {
    scrollToBottom("instant");
  }, []);

  useEffect(() => {
    scrollToBottom("smooth");
  }, [messages, isPending]);

  // Handle send message
  const handleSend = (textToSend: string) => {
    const text = textToSend.trim();
    if (!text) return;
    if (text.length > MESSAGE_MAX_LENGTH) {
      setError(`ข้อความยาวเกิน ${MESSAGE_MAX_LENGTH} ตัวอักษร`);
      return;
    }
    if (quotaLeft <= 0) {
      setError("คุณใช้โควตาแชทของวันนี้หมดแล้ว");
      return;
    }

    setError(null);
    setConfirmClear(false);

    // Optimistically add user message
    const tempUserMessage: ChatMessage = {
      id: `temp-user-${(tempIdRef.current += 1)}`,
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMessage]);
    setInputValue("");
    setQuotaLeft((prev) => Math.max(0, prev - 1));

    startTransition(async () => {
      const result = await sendCoachMessage(text);
      if ("error" in result) {
        setError(result.error);
        if (result.userMessage) {
          const savedUserMessage = result.userMessage;
          setMessages((prev) =>
            prev.map((m) => (m.id === tempUserMessage.id ? savedUserMessage : m))
          );
        } else {
          setMessages((prev) => prev.filter((m) => m.id !== tempUserMessage.id));
          setQuotaLeft((prev) => result.quotaLeft ?? Math.min(DAILY_MESSAGE_LIMIT, prev + 1));
          setInputValue(text);
        }
      } else {
        setMessages((prev) => [...prev, result.message]);
      }
    });
  };

  // Handle retry reply
  const handleRetry = () => {
    if (messages.length === 0 || !needsReply(messages)) return;

    setError(null);
    startTransition(async () => {
      const result = await retryCoachReply();
      if ("error" in result) {
        setError(result.error);
      } else {
        setMessages((prev) => [...prev, result.message]);
      }
    });
  };

  // Handle clear history
  const handleClearHistory = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }

    setError(null);
    setConfirmClear(false);

    startTransition(async () => {
      const result = await clearChatHistory();
      if ("error" in result) {
        setError(result.error);
      } else {
        setMessages([]);
        setQuotaLeft(DAILY_MESSAGE_LIMIT); // ลบแถวออก = countMessagesToday() กลับไปนับได้ใหม่
      }
    });
  };

  useEffect(() => {
    if (!confirmClear) return;
    const timer = setTimeout(() => setConfirmClear(false), 5000);
    return () => clearTimeout(timer);
  }, [confirmClear]);

  const showChips = messages.length === 0 && !isPending && quotaLeft > 0;
  const showRetry = needsReply(messages) && !isPending;

  return (
    <div className="flex flex-col space-y-4">
      {/* Top bar controls */}
      <div className="flex items-center justify-between pb-1">
        <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary text-xs">
          โควตาแชทวันนี้เหลือ: {quotaLeft} ข้อความ
        </Badge>

        {messages.length > 0 && (
          <Button
            variant={confirmClear ? "destructive" : "ghost"}
            size="sm"
            onClick={handleClearHistory}
            disabled={isPending}
            className="h-9 gap-1.5 text-xs transition-all duration-200 min-h-11 px-3"
          >
            <Trash2 className="size-4" />
            {confirmClear ? "ยืนยันล้างแชท" : "ล้างประวัติ"}
          </Button>
        )}
      </div>

      {/* Chat Container Card */}
      <Card className="flex flex-col justify-between border-border/40 shadow-sm bg-card">
        <CardContent className="p-4">
          <div className="h-[400px] overflow-y-auto pr-1 space-y-4 flex flex-col scrollbar-thin">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3">
                <div className="p-3 rounded-full bg-primary/5 text-primary">
                  <MessageSquare className="size-8" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-sm">เริ่มคุยกับโค้ชสุขภาพประจำตัวของคุณ</p>
                  <p className="text-xs text-muted-foreground max-w-[280px]">
                    ปรึกษาเรื่องพฤติกรรมการกิน การนอน
                    หรือการขยับร่างกายเพื่อช่วยปรับปรุงชีวิตประจำวัน
                  </p>
                </div>
              </div>
            ) : (
              messages.map((m) =>
                m.role === "user" ? (
                  <UserMessage key={m.id} message={m} />
                ) : (
                  <CoachMessage key={m.id} message={m} />
                )
              )
            )}

            {isPending && messages.length > 0 && messages.at(-1)?.role === "user" && (
              <PendingReply />
            )}

            <div ref={messagesEndRef} />
          </div>
        </CardContent>

        {/* Input & Options panel */}
        <div className="border-t border-border/40 p-4 space-y-4 bg-muted/10">
          {/* Conversation starters */}
          {showChips && (
            <div className="space-y-2">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                คำถามแนะนำ:
              </p>
              <div className="flex flex-wrap gap-2">
                {STARTERS.map((starter) => (
                  <Button
                    key={starter}
                    type="button"
                    variant="outline"
                    onClick={() => handleSend(starter)}
                    className="min-h-11 rounded-full px-4 text-sm font-normal"
                  >
                    {starter}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
              <span className="leading-normal">{error}</span>
            </div>
          )}

          {showRetry && (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 p-3 text-sm">
              <span className="leading-normal text-muted-foreground">
                ข้อความล่าสุดยังไม่ได้รับคำตอบจากโค้ช
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={handleRetry}
                className="min-h-11 shrink-0 gap-1.5 px-3 text-xs"
              >
                <RefreshCw className="size-3" />
                ลองใหม่
              </Button>
            </div>
          )}

          {/* Quota reached notice */}
          {quotaLeft === 0 && <QuotaReachedNotice />}

          {/* TextInput form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(inputValue);
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder={quotaLeft > 0 ? "คุยกับโค้ชได้เลย..." : "วันนี้โควตาแชทหมดแล้ว"}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={quotaLeft <= 0 || isPending}
                maxLength={MESSAGE_MAX_LENGTH}
                className="w-full min-h-11 bg-background text-sm rounded-lg pr-12 focus-visible:border-ring focus-visible:ring-3"
              />
              {inputValue.length > 0 && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-mono">
                  {inputValue.length}/{MESSAGE_MAX_LENGTH}
                </span>
              )}
            </div>

            <Button
              type="submit"
              size="icon"
              disabled={quotaLeft <= 0 || isPending || !inputValue.trim()}
              className="size-11 shrink-0 bg-primary hover:bg-primary/95 text-primary-foreground rounded-lg"
              aria-label="ส่งข้อความ"
            >
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
