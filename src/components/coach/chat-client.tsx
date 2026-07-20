"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { Trash2, Send, RefreshCw, MessageSquare, Loader2 } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { acceptGoal, recommendGoals } from "@/lib/goals/actions";
import { GOAL_TITLE_MAX_LENGTH, SITUATION_LABELS, type GoalSuggestion } from "@/lib/goals/types";
import { CONSTRAINT_LABELS, EARLY_DAY_LABELS } from "@/lib/onboarding/types";
import { PILLAR_LABELS } from "@/lib/checkins/labels";
import type { Pillar } from "@/lib/domain";

const GOAL_STARTER = "อยากตั้งเป้าสัปดาห์หน้า";
const STARTERS = ["ช่วยดู pattern สัปดาห์นี้", GOAL_STARTER];

const PILLAR_OPTIONS: { value: Pillar; hint: string }[] = [
  { value: "eating", hint: "กินครบมื้อ ปรับตารางกิน" },
  { value: "sleep", hint: "นอนเร็วขึ้น พักระหว่างทำงาน" },
  { value: "movement", hint: "ยืดเหยียด เดินเพิ่มขึ้น" },
];

const DAY_OPTIONS = Object.entries(EARLY_DAY_LABELS) as [string, string][];
const CONSTRAINT_OPTIONS = Object.entries(CONSTRAINT_LABELS) as [string, string][];

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

  // Guided goal flow state
  const [guidedFlow, setGuidedFlow] = useState(false);
  const [guidedStep, setGuidedStep] = useState<
    "pillar" | "busy_days" | "constraints" | "select_goal"
  >("pillar");
  const [guidedData, setGuidedData] = useState<{
    pillar?: Pillar;
    busyDays: string[];
    constraints: string[];
  }>({
    busyDays: [],
    constraints: [],
  });
  const [goalOptions, setGoalOptions] = useState<GoalSuggestion[] | null>(null);
  const [selectedGoalIndex, setSelectedGoalIndex] = useState<number>(0);
  const [editedGoalTitle, setEditedGoalTitle] = useState<string>("");

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: "nearest" });
  };

  useEffect(() => {
    scrollToBottom("instant");
  }, []);

  useEffect(() => {
    scrollToBottom("smooth");
  }, [messages, isPending, guidedStep, guidedFlow]);

  // Generate guided flow message list for rendering
  const getGuidedMessages = (): ChatMessage[] => {
    const list: ChatMessage[] = [];
    if (!guidedFlow) return list;

    // Step 1 Coach Message
    list.push({
      id: "guided-coach-1",
      role: "coach",
      content:
        "ยินดีครับ! มาวางแผนตั้งเป้าสุขภาพเล็กๆ สำหรับสัปดาห์หน้ากันดีกว่า\n\nถ้าเริ่มเปลี่ยนแค่ 1 อย่างในสัปดาห์หน้า คุณอยากเริ่มจากด้านไหนดีครับ?",
      createdAt: new Date().toISOString(),
    });

    if (guidedStep === "pillar") return list;

    // User select pillar response
    const pillarText = `อยากเริ่มจากด้าน${PILLAR_LABELS[guidedData.pillar ?? "eating"]}ครับ`;

    list.push({
      id: "guided-user-1",
      role: "user",
      content: pillarText,
      createdAt: new Date().toISOString(),
    });

    // Step 2 Coach Message
    list.push({
      id: "guided-coach-2",
      role: "coach",
      content: `รับทราบครับ เรื่อง${PILLAR_LABELS[guidedData.pillar ?? "eating"]}นะ\n\nสัปดาห์หน้ามีวันไหนที่คุณคิดว่าจะมีตารางเรียน/ทำงานที่แน่น หรือยุ่งเป็นพิเศษบ้างไหมครับ?`,
      createdAt: new Date().toISOString(),
    });

    if (guidedStep === "busy_days") return list;

    // User select busy days response
    const formatDays = (days: string[]) => {
      if (days.length === 0) return "ไม่มีวันไหนเป็นพิเศษครับ";
      const dayNames = days.map((d) => EARLY_DAY_LABELS[d as keyof typeof EARLY_DAY_LABELS]);
      return `วันที่มีตารางแน่น: ${dayNames.join(" ")} ครับ`;
    };

    list.push({
      id: "guided-user-2",
      role: "user",
      content: formatDays(guidedData.busyDays),
      createdAt: new Date().toISOString(),
    });

    // Step 3 Coach Message
    list.push({
      id: "guided-coach-3",
      role: "coach",
      content:
        "เข้าใจแล้วครับ\n\nปกติแล้วคุณมีข้อจำกัดอะไรบ้างไหมครับที่ทำให้ดูแลตัวเองยากในด้านนี้? เช่น เวลา สถานที่ ความเหนื่อย หรือเรื่องงบประมาณ",
      createdAt: new Date().toISOString(),
    });

    if (guidedStep === "constraints") return list;

    // User select constraints response
    const formatConstraints = (cons: string[]) => {
      if (cons.length === 0) return "ไม่มีข้อจำกัดเป็นพิเศษครับ";
      const conNames = cons.map((c) => CONSTRAINT_LABELS[c as keyof typeof CONSTRAINT_LABELS]);
      return `ข้อจำกัด: ${conNames.join(", ")} ครับ`;
    };

    list.push({
      id: "guided-user-3",
      role: "user",
      content: formatConstraints(guidedData.constraints),
      createdAt: new Date().toISOString(),
    });

    // Step 4 Coach Message
    list.push({
      id: "guided-coach-4",
      role: "coach",
      content:
        "ขอบคุณสำหรับข้อมูลครับ นี่คือ Micro Goal 2 ข้อที่ผมแนะนำสำหรับคุณ ลองเลือกข้อที่ชอบหรือสามารถปรับแต่งข้อความตามสะดวกได้เลยครับ",
      createdAt: new Date().toISOString(),
    });

    return list;
  };

  // Handle send message
  const handleSend = (textToSend: string) => {
    const text = textToSend.trim();
    if (!text) return;

    // เข้า guided flow เฉพาะตอนกดปุ่ม starter — ข้อความที่ผู้ใช้พิมพ์เองต้องถึงโค้ชเสมอ
    if (text === GOAL_STARTER) {
      setGuidedFlow(true);
      setGuidedStep("pillar");
      setGuidedData({
        pillar: undefined,
        busyDays: [],
        constraints: [],
      });
      setError(null);
      return;
    }

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

  // Guided flow state setters
  const handlePillarSelect = (pillar: Pillar) => {
    setGuidedData((prev) => ({ ...prev, pillar }));
    setGuidedStep("busy_days");
    setError(null);
  };

  const toggleBusyDay = (day: string) => {
    setGuidedData((prev) => {
      const busyDays = prev.busyDays.includes(day)
        ? prev.busyDays.filter((d) => d !== day)
        : [...prev.busyDays, day];
      return { ...prev, busyDays };
    });
  };

  const handleBusyDaysSubmit = (busyDays: string[]) => {
    setGuidedData((prev) => ({ ...prev, busyDays }));
    setGuidedStep("constraints");
    setError(null);
  };

  const toggleConstraint = (constraint: string) => {
    setGuidedData((prev) => {
      const constraints = prev.constraints.includes(constraint)
        ? prev.constraints.filter((c) => c !== constraint)
        : [...prev.constraints, constraint];
      return { ...prev, constraints };
    });
  };

  const handleConstraintsSubmit = (constraints: string[]) => {
    setGuidedData((prev) => ({ ...prev, constraints }));
    setGuidedStep("select_goal");
    setError(null);
    setGoalOptions(null);
    setEditedGoalTitle("");

    startTransition(async () => {
      const result = await recommendGoals({
        pillar: guidedData.pillar,
        busyDays: guidedData.busyDays,
        constraints,
      });

      if ("error" in result) {
        setError(result.error);
        return;
      }

      setGoalOptions(result.suggestions);
      setSelectedGoalIndex(0);
      setEditedGoalTitle(result.suggestions[0]?.title ?? "");
    });
  };

  const handleBackStep = () => {
    setError(null);
    if (guidedStep === "busy_days") {
      setGuidedStep("pillar");
    } else if (guidedStep === "constraints") {
      setGuidedStep("busy_days");
    } else if (guidedStep === "select_goal") {
      setGuidedStep("constraints");
    }
  };

  const handleCancelGuidedFlow = () => {
    setGuidedFlow(false);
    setGuidedStep("pillar");
    setError(null);
  };

  const handleSelectOption = (index: number) => {
    if (!goalOptions) return;
    setSelectedGoalIndex(index);
    setEditedGoalTitle(goalOptions[index]?.title ?? "");
  };

  const handleSaveGoal = () => {
    const title = editedGoalTitle.trim();
    const situation = goalOptions?.[selectedGoalIndex]?.situation;
    if (!title || !situation) return;

    setError(null);

    startTransition(async () => {
      const result = await acceptGoal(title, situation);
      if ("error" in result) {
        setError(result.error);
        return;
      }

      const successMessage: ChatMessage = {
        id: `guided-success-${(tempIdRef.current += 1)}`,
        role: "coach",
        content: `บันทึกเป้าหมาย "${title}" เรียบร้อยแล้วครับ\n\nเป้าหมายนี้จะเริ่มมีผลในสัปดาห์หน้าทันที เปิดดูและติ๊กความคืบหน้าได้ในหน้า "เป้าหมาย" ครับ`,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, successMessage]);
      setGuidedFlow(false);
      setGuidedStep("pillar");
      setGoalOptions(null);
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

  const showChips = messages.length === 0 && !isPending && quotaLeft > 0 && !guidedFlow;
  const showRetry = needsReply(messages) && !isPending && !guidedFlow;
  const displayMessages = guidedFlow ? [...messages, ...getGuidedMessages()] : messages;

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
          <div
            role="log"
            aria-live="polite"
            aria-label="บทสนทนากับโค้ช"
            className="h-[400px] overflow-y-auto pr-1 space-y-4 flex flex-col scrollbar-thin"
          >
            {displayMessages.length === 0 ? (
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
              displayMessages.map((m) =>
                m.role === "user" ? (
                  <UserMessage key={m.id} message={m} />
                ) : (
                  <CoachMessage key={m.id} message={m} />
                )
              )
            )}

            {isPending && displayMessages.length > 0 && displayMessages.at(-1)?.role === "user" && (
              <PendingReply />
            )}

            <div ref={messagesEndRef} />
          </div>
        </CardContent>

        {/* Input & Options panel */}
        <div className="border-t border-border/40 p-4 space-y-4 bg-muted/10">
          {guidedFlow ? (
            <div className="space-y-4">
              {guidedStep === "pillar" && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    กรุณาเลือกด้านที่ต้องการตั้งเป้าหมาย:
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {PILLAR_OPTIONS.map((option) => (
                      <Button
                        key={option.value}
                        type="button"
                        variant="outline"
                        onClick={() => handlePillarSelect(option.value)}
                        className="min-h-11 justify-start px-4 py-2 text-sm font-normal"
                      >
                        {PILLAR_LABELS[option.value]} ({option.hint})
                      </Button>
                    ))}
                  </div>
                  <div className="border-t border-border/40 pt-3 flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleCancelGuidedFlow}
                      className="min-h-11 text-xs text-muted-foreground"
                    >
                      ยกเลิกการตั้งเป้าหมาย
                    </Button>
                  </div>
                </div>
              )}

              {guidedStep === "busy_days" && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    เลือกวันในสัปดาห์หน้าที่ตารางแน่น / งานยุ่งเป็นพิเศษ:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {DAY_OPTIONS.map(([value, label]) => {
                      const isSelected = guidedData.busyDays.includes(value);
                      return (
                        <Button
                          key={value}
                          type="button"
                          variant={isSelected ? "default" : "outline"}
                          aria-pressed={isSelected}
                          onClick={() => toggleBusyDay(value)}
                          className="min-h-11 rounded-full px-4 text-sm font-normal"
                        >
                          {label}
                        </Button>
                      );
                    })}
                  </div>
                  <div className="border-t border-border/40 pt-3 flex gap-2 justify-between">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleBackStep}
                      className="min-h-11 text-xs"
                    >
                      ย้อนกลับ
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => handleBusyDaysSubmit([])}
                        className="min-h-11 text-xs"
                      >
                        ไม่มีวันยุ่งเป็นพิเศษ
                      </Button>
                      <Button
                        type="button"
                        onClick={() => handleBusyDaysSubmit(guidedData.busyDays)}
                        className="min-h-11 text-xs bg-primary text-primary-foreground hover:bg-primary/95"
                      >
                        ถัดไป
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {guidedStep === "constraints" && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    เลือกข้อจำกัดของคุณ (เลือกได้มากกว่า 1 ข้อ):
                  </p>
                  <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                    {CONSTRAINT_OPTIONS.map(([value, label]) => {
                      const isSelected = guidedData.constraints.includes(value);
                      return (
                        <Button
                          key={value}
                          type="button"
                          variant={isSelected ? "default" : "outline"}
                          aria-pressed={isSelected}
                          onClick={() => toggleConstraint(value)}
                          className="min-h-11 justify-start text-sm font-normal"
                        >
                          {label}
                        </Button>
                      );
                    })}
                  </div>
                  <div className="border-t border-border/40 pt-3 flex gap-2 justify-between">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleBackStep}
                      className="min-h-11 text-xs"
                    >
                      ย้อนกลับ
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => handleConstraintsSubmit([])}
                        className="min-h-11 text-xs"
                      >
                        ไม่มีข้อจำกัด
                      </Button>
                      <Button
                        type="button"
                        onClick={() => handleConstraintsSubmit(guidedData.constraints)}
                        className="min-h-11 text-xs bg-primary text-primary-foreground hover:bg-primary/95"
                      >
                        ถัดไป
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {guidedStep === "select_goal" && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    เลือกเป้าหมายเล็ก ๆ (Micro Goal) ที่แนะนำสำหรับคุณ:
                  </p>
                  {!goalOptions ? (
                    <div className="flex items-center gap-2 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                      <Loader2 className="size-4 shrink-0 animate-spin" />
                      กำลังดูบันทึกของคุณเพื่อเลือกเป้าหมายที่ทำได้จริง...
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2">
                      {goalOptions.map((option, index) => {
                        const isSelected = selectedGoalIndex === index;
                        return (
                          <button
                            key={option.situation}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => handleSelectOption(index)}
                            className={cn(
                              "w-full min-h-11 rounded-lg border p-3 text-left text-sm transition-all focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                              isSelected
                                ? "border-primary bg-primary/5 font-medium"
                                : "border-border hover:bg-muted/40"
                            )}
                          >
                            <span>{option.title}</span>
                            <span className="mt-1 block text-xs font-normal text-muted-foreground">
                              {SITUATION_LABELS[option.situation]}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <div className="space-y-2 pt-1">
                    <label
                      htmlFor="goal-adjust-input"
                      className="text-xs font-medium text-muted-foreground"
                    >
                      ปรับแต่งเป้าหมายให้เข้ากับตัวเองยิ่งขึ้นได้:
                    </label>
                    <Input
                      id="goal-adjust-input"
                      type="text"
                      value={editedGoalTitle}
                      onChange={(e) => setEditedGoalTitle(e.target.value)}
                      disabled={isPending}
                      maxLength={GOAL_TITLE_MAX_LENGTH}
                      className="w-full min-h-11 bg-background text-sm focus-visible:border-ring focus-visible:ring-3"
                      placeholder="ปรับเปลี่ยนเป้าหมายของคุณที่นี่…"
                    />
                  </div>

                  <div className="border-t border-border/40 pt-3 flex gap-2 justify-between">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleBackStep}
                      disabled={isPending}
                      className="min-h-11 text-xs"
                    >
                      ย้อนกลับ
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSaveGoal}
                      disabled={isPending || !goalOptions || !editedGoalTitle.trim()}
                      className="min-h-11 text-xs bg-primary text-primary-foreground hover:bg-primary/95"
                    >
                      {isPending ? "กำลังบันทึก…" : "บันทึกเป้าหมาย"}
                    </Button>
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive mt-2">
                  <span className="leading-normal">{error}</span>
                </div>
              )}
            </div>
          ) : (
            <>
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
                <div
                  role="alert"
                  className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive"
                >
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
                    placeholder={quotaLeft > 0 ? "คุยกับโค้ชได้เลย…" : "วันนี้โควตาแชทหมดแล้ว"}
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
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
