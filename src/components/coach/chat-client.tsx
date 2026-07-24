"use client";

import { Fragment, useState, useEffect, useRef, useTransition } from "react";
import {
  Trash2,
  Send,
  RefreshCw,
  MessageSquare,
  MessageCircle,
  Loader2,
  Moon,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorNotice, GentleNotice } from "@/components/ui/notice";
import {
  UserMessage,
  CoachMessage,
  DaySeparator,
  PendingReply,
  QuotaReachedNotice,
} from "./message-variants";
import { toBangkokDate } from "@/lib/checkins/date";
import { sendCoachMessage, retryCoachReply, clearChatHistory } from "@/lib/chat/actions";
import type { CoachOpener } from "@/lib/chat/opener";
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
  opener?: CoachOpener | null;
}

export function CoachChatClient({
  initialMessages,
  initialQuotaLeft,
  opener,
}: CoachChatClientProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [quotaLeft, setQuotaLeft] = useState<number>(initialQuotaLeft);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const clearFeedback = () => {
    setError(null);
    setNotice(null);
  };

  // Transition state for server actions
  const [isPending, startTransition] = useTransition();

  // Scroll ref
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const tempIdRef = useRef(0);

  const resizeTextarea = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    resizeTextarea();
  };

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
    if (messages.length > 0) scrollToBottom("instant");
  }, []);

  useEffect(() => {
    if (messages.length > 0 || guidedFlow) scrollToBottom("smooth");
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
        "ยินดีครับ! มาวางแผนตั้งเป้าสุขภาพเล็ก ๆ สำหรับสัปดาห์หน้ากันดีกว่า\n\nถ้าเริ่มเปลี่ยนแค่ 1 อย่างในสัปดาห์หน้า คุณอยากเริ่มจากด้านไหนดีครับ?",
      createdAt: new Date().toISOString(),
    });

    if (guidedStep === "pillar") return list;

    // User select pillar response
    const pillarText = `อยากเริ่มจากด้าน${PILLAR_LABELS[guidedData.pillar ?? "eating"]}`;

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
      if (days.length === 0) return "ไม่มีวันไหนเป็นพิเศษ";
      const dayNames = days.map((d) => EARLY_DAY_LABELS[d as keyof typeof EARLY_DAY_LABELS]);
      return `วันที่มีตารางแน่น: ${dayNames.join(" ")}`;
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
      if (cons.length === 0) return "ไม่มีข้อจำกัดเป็นพิเศษ";
      const conNames = cons.map((c) => CONSTRAINT_LABELS[c as keyof typeof CONSTRAINT_LABELS]);
      return `ข้อจำกัด: ${conNames.join(", ")}`;
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
      clearFeedback();
      return;
    }

    if (text.length > MESSAGE_MAX_LENGTH) {
      setError(`ข้อความยาวเกิน ${MESSAGE_MAX_LENGTH} ตัวอักษร`);
      return;
    }
    if (quotaLeft <= 0) {
      setNotice("คุยกับโค้ชครบสำหรับวันนี้แล้ว — พรุ่งนี้กลับมาคุยต่อได้เลย");
      return;
    }

    clearFeedback();
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
    requestAnimationFrame(resizeTextarea);
    setQuotaLeft((prev) => Math.max(0, prev - 1));

    startTransition(async () => {
      const result = await sendCoachMessage(text);
      if ("ok" in result) {
        setMessages((prev) => [...prev, result.message]);
        return;
      }

      if ("notice" in result) setNotice(result.notice);
      else setError(result.error);

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
    });
  };

  // Guided flow state setters
  const handlePillarSelect = (pillar: Pillar) => {
    setGuidedData((prev) => ({ ...prev, pillar }));
    setGuidedStep("busy_days");
    clearFeedback();
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
    clearFeedback();
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
    clearFeedback();
    setGoalOptions(null);
    setEditedGoalTitle("");

    startTransition(async () => {
      const result = await recommendGoals({
        pillar: guidedData.pillar,
        busyDays: guidedData.busyDays,
        constraints,
      });

      if ("notice" in result) {
        setNotice(result.notice);
        return;
      }
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
    clearFeedback();
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
    clearFeedback();
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

    clearFeedback();

    startTransition(async () => {
      const result = await acceptGoal(title, situation);
      if ("notice" in result) {
        setNotice(result.notice);
        return;
      }
      if ("error" in result) {
        setError(result.error);
        return;
      }

      const successMessage: ChatMessage = {
        id: `guided-success-${(tempIdRef.current += 1)}`,
        role: "coach",
        content: `บันทึกเป้าหมาย "${title}" เรียบร้อยแล้วครับ\n\nเปิดดูได้ในหน้า "เป้าหมาย" — ติ๊กความคืบหน้าได้ตั้งแต่วันนี้เลย ไม่ต้องรอถึงสัปดาห์หน้าครับ`,
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

    clearFeedback();
    startTransition(async () => {
      const result = await retryCoachReply();
      if ("ok" in result) setMessages((prev) => [...prev, result.message]);
      else if ("notice" in result) setNotice(result.notice);
      else setError(result.error);
    });
  };

  // Handle clear history
  const handleClearHistory = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }

    clearFeedback();
    setConfirmClear(false);

    startTransition(async () => {
      const result = await clearChatHistory();
      if ("error" in result) {
        setError(result.error);
      } else {
        setMessages([]);
      }
    });
  };

  useEffect(() => {
    if (!confirmClear) return;
    const timer = setTimeout(() => setConfirmClear(false), 5000);
    return () => clearTimeout(timer);
  }, [confirmClear]);

  const showChips = messages.length === 0 && !isPending && quotaLeft > 0 && !guidedFlow && !opener;
  const showRetry = needsReply(messages) && !isPending && !guidedFlow;
  const showCounter = inputValue.length > MESSAGE_MAX_LENGTH * 0.8;
  const displayMessages = guidedFlow ? [...messages, ...getGuidedMessages()] : messages;

  return (
    <div className="flex h-[calc(100dvh-17.75rem-env(safe-area-inset-top,0px))] min-h-96 flex-col gap-3 lg:h-[calc(100dvh-13rem)]">
      {/* Top bar controls */}
      <div className="flex min-h-9 shrink-0 items-center justify-between">
        {quotaLeft > 0 && quotaLeft <= 2 ? (
          <span className="text-xs text-muted-foreground">
            เหลือคุยกับโค้ชได้อีก {quotaLeft} ข้อความวันนี้
          </span>
        ) : (
          <span />
        )}

        {messages.length > 0 && (
          <Button
            variant={confirmClear ? "destructive" : "ghost"}
            size="sm"
            onClick={handleClearHistory}
            disabled={isPending}
            className="min-h-11 gap-1.5 px-3 text-xs transition-all duration-200"
          >
            <Trash2 className="size-4" />
            {confirmClear ? "ยืนยันล้างแชท" : "ล้างประวัติ"}
          </Button>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border/40 bg-card">
        <div
          role="log"
          aria-live="polite"
          aria-label="บทสนทนากับโค้ช"
          className="flex min-h-0 flex-1 flex-col space-y-4 overflow-y-auto p-4"
        >
          {displayMessages.length === 0 ? (
            opener ? (
              <div className="flex gap-2.5">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <MessageCircle className="size-4" />
                </div>
                <div className="min-w-0 flex-1 space-y-3 pt-0.5">
                  <p className="text-xs font-medium text-muted-foreground">โค้ช</p>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{opener.fact}</p>
                    <p className="text-lg font-medium">{opener.question}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
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
                  <p className="text-xs text-muted-foreground">
                    หรือพิมพ์เล่าเรื่องของคุณด้านล่างได้เลย
                  </p>
                </div>
              </div>
            ) : (
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
            )
          ) : (
            displayMessages.map((m, index) => {
              const previous = displayMessages[index - 1];
              const newDay =
                !previous || toBangkokDate(previous.createdAt) !== toBangkokDate(m.createdAt);
              return (
                <Fragment key={m.id}>
                  {newDay && <DaySeparator date={m.createdAt} />}
                  {m.role === "user" ? <UserMessage message={m} /> : <CoachMessage message={m} />}
                </Fragment>
              );
            })
          )}

          {isPending && displayMessages.length > 0 && displayMessages.at(-1)?.role === "user" && (
            <PendingReply />
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input & Options panel */}
        <div className="shrink-0 border-t border-border/40 p-4 space-y-4 bg-muted/10">
          {guidedFlow ? (
            <div className="space-y-4">
              {guidedStep === "pillar" && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground">
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
                  <p className="text-xs font-semibold text-muted-foreground">
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
                  <p className="text-xs font-semibold text-muted-foreground">
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
                  <p className="text-xs font-semibold text-muted-foreground">
                    เลือกเป้าหมายเล็ก ๆ (Micro Goal) ที่แนะนำสำหรับคุณ:
                  </p>
                  {!goalOptions ? (
                    error ? null : (
                      <div className="flex items-center gap-2 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                        <Loader2 className="size-4 shrink-0 animate-spin" />
                        กำลังดูบันทึกของคุณเพื่อเลือกเป้าหมายที่ทำได้จริง...
                      </div>
                    )
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
                      className="w-full min-h-11 bg-background focus-visible:border-ring focus-visible:ring-3"
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

              {notice && <GentleNotice className="mt-2">{notice}</GentleNotice>}
              {error && <ErrorNotice className="mt-2">{error}</ErrorNotice>}
            </div>
          ) : (
            <>
              {/* Conversation starters */}
              {showChips && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">คำถามแนะนำ:</p>
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

              {messages.length > 0 && inputValue === "" && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSend(GOAL_STARTER)}
                    disabled={isPending}
                    className="min-h-11 gap-1.5 rounded-full px-4 text-sm font-normal"
                  >
                    <Target className="size-4 shrink-0 text-primary" />
                    ตั้งเป้าสัปดาห์หน้า
                  </Button>
                </div>
              )}

              {notice && <GentleNotice icon={Moon}>{notice}</GentleNotice>}
              {error && <ErrorNotice>{error}</ErrorNotice>}

              {showRetry && (
                <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 p-3 text-sm">
                  <span className="text-muted-foreground">
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
                className="flex items-end gap-2"
              >
                <div className="relative flex-1">
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    aria-label="พิมพ์ข้อความถึงโค้ช"
                    placeholder={quotaLeft > 0 ? "คุยกับโค้ชได้เลย…" : "วันนี้โควตาแชทหมดแล้ว"}
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                        e.preventDefault();
                        handleSend(inputValue);
                      }
                    }}
                    disabled={quotaLeft <= 0 || isPending}
                    maxLength={MESSAGE_MAX_LENGTH}
                    className={cn(
                      "block max-h-32 min-h-11 w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-base break-words shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50",
                      showCounter && "pr-16"
                    )}
                  />
                  {showCounter && (
                    <span className="absolute right-3 bottom-2 font-mono text-[11px] text-muted-foreground">
                      {inputValue.length}/{MESSAGE_MAX_LENGTH}
                    </span>
                  )}
                </div>

                <Button
                  type="submit"
                  size="icon"
                  disabled={quotaLeft <= 0 || isPending || !inputValue.trim()}
                  className="size-11 shrink-0 rounded-lg bg-primary text-primary-foreground hover:bg-primary/95"
                  aria-label="ส่งข้อความ"
                >
                  <Send className="size-4" />
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
