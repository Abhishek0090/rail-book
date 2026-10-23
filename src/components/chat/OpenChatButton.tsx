"use client";

import { openChat } from "./ChatAssistant";

// Any button that opens the assistant, optionally with a first message.
export default function OpenChatButton({
  message,
  className,
  children,
}: {
  message?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button type="button" onClick={() => openChat(message)} className={className}>
      {children}
    </button>
  );
}
