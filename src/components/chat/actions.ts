"use server";

import { greeting, reply, type ChatState } from "@/lib/chatEngine";
import { getCurrentUser } from "@/lib/userAuth";

// The assistant runs on the server so it sees trains and bookings that
// admins add at runtime, and books as the signed-in passenger.
// Swap reply() for an LLM call here later if wanted.
export async function chatReply(state: ChatState, text: string) {
  return reply(state, String(text).slice(0, 300), await getCurrentUser());
}

export async function chatGreeting() {
  return greeting();
}
