"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Bot, MessageCircle, RotateCcw, Send, X } from "lucide-react";
import {
  INITIAL_STATE,
  type ChatMessage,
  type ChatState,
} from "@/lib/chatEngine";
import { chatGreeting, chatReply } from "./actions";

export const OPEN_CHAT_EVENT = "railbook:open-chat";

// Opens the assistant from anywhere, optionally sending a first message.
export const openChat = (message?: string) =>
  window.dispatchEvent(new CustomEvent(OPEN_CHAT_EVENT, { detail: message }));

type Shown = ChatMessage & { key: number };

export default function ChatAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Shown[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<ChatState>(INITIAL_STATE);
  const keyRef = useRef(0);
  const startedRef = useRef(false);

  const show = (list: ChatMessage[]) =>
    setMessages((prev) => [
      ...prev,
      ...list.map((m) => ({ ...m, key: ++keyRef.current })),
    ]);

  const start = async () => {
    if (startedRef.current) return;
    startedRef.current = true;
    show(await chatGreeting());
  };

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    show([{ id: 0, role: "user", text: trimmed }]);
    setInput("");
    setTyping(true);
    try {
      const [nextState, botMessages] = await chatReply(stateRef.current, trimmed);
      stateRef.current = nextState;
      show(botMessages);
    } catch {
      show([{ id: 0, role: "bot", text: "Something went wrong. Please try again." }]);
    } finally {
      setTyping(false);
    }
  };

  const reset = async () => {
    stateRef.current = INITIAL_STATE;
    setMessages([]);
    startedRef.current = false;
    await start();
  };

  useEffect(() => {
    const handler = async (event: Event) => {
      setOpen(true);
      await start();
      const detail = (event as CustomEvent<string | undefined>).detail;
      if (detail) await send(detail);
    };
    window.addEventListener(OPEN_CHAT_EVENT, handler);
    return () => window.removeEventListener(OPEN_CHAT_EVENT, handler);
    // start and send only touch refs and state setters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, typing]);

  const toggle = () => {
    setOpen((o) => !o);
    void start();
  };

  const lastBot = [...messages].reverse().find((m) => m.role === "bot");

  return (
    <>
      {open && (
        <div className="fixed inset-x-2 bottom-20 z-50 flex h-[min(600px,75vh)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl sm:inset-x-auto sm:right-6 sm:w-[380px]">
          {/* Header */}
          <div className="flex items-center gap-3 bg-brand-gradient px-4 py-3 text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
              <Bot size={20} />
            </span>
            <div className="flex-1">
              <p className="font-semibold leading-tight">RailBook Assistant</p>
              <p className="text-xs text-white/75">
                Book tickets, PNR, live status
              </p>
            </div>
            <button
              onClick={reset}
              aria-label="Start over"
              className="rounded-full p-1.5 hover:bg-white/15"
            >
              <RotateCcw size={16} />
            </button>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="rounded-full p-1.5 hover:bg-white/15"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4"
          >
            {messages.map((m) => (
              <div
                key={m.key}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3 py-2 text-sm ${
                    m.role === "user"
                      ? "rounded-br-sm bg-brand-gradient text-white"
                      : "rounded-bl-sm border border-gray-200 bg-white text-gray-800"
                  }`}
                >
                  {m.text}
                  {m.link && (
                    <Link
                      href={m.link.href}
                      onClick={() => setOpen(false)}
                      className="mt-2 flex items-center justify-center gap-1 rounded-lg bg-brand-gradient px-3 py-2 text-sm font-medium text-white hover:brightness-110"
                    >
                      {m.link.label} <ArrowRight size={14} />
                    </Link>
                  )}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex gap-1 px-2" aria-label="Assistant is typing">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-2 w-2 animate-bounce rounded-full bg-grape-400"
                    style={{ animationDelay: `${i * 120}ms` }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Quick replies for the latest bot message */}
          {lastBot?.chips && !typing && (
            <div className="flex gap-2 overflow-x-auto border-t border-gray-100 bg-white px-3 py-2">
              {lastBot.chips.map((chip) => (
                <button
                  key={chip}
                  onClick={() => send(chip)}
                  className="shrink-0 rounded-full border border-grape-200 bg-grape-50 px-3 py-1 text-xs text-grape-700 hover:bg-grape-100"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form
            className="flex items-center gap-2 border-t border-gray-200 bg-white p-3"
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. Mumbai to Delhi tomorrow"
              maxLength={300}
              className="flex-1 rounded-full border border-gray-200 px-4 py-2 text-sm outline-none focus:border-brand-400"
            />
            <button
              type="submit"
              aria-label="Send"
              disabled={typing}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gradient text-white hover:brightness-110 disabled:opacity-60"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      {/* Launcher */}
      <button
        onClick={toggle}
        aria-label={open ? "Close chat assistant" : "Open chat assistant"}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-brand-gradient px-4 py-3 font-medium text-white shadow-lg hover:brightness-110 sm:right-6"
      >
        {open ? <X size={20} /> : <MessageCircle size={20} />}
        <span className="hidden sm:inline">
          {open ? "Close" : "Book via chat"}
        </span>
      </button>
    </>
  );
}
