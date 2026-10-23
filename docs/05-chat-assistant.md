# 05 - Chat assistant

The floating "Book via chat" button is on every page (`Provider` renders `ChatAssistant`). Any component can
open it, optionally with a first message:

```tsx
import OpenChatButton from "@/components/chat/OpenChatButton";

<OpenChatButton message="Mumbai to Delhi tomorrow">Try it</OpenChatButton>
```

Under the hood this dispatches a `railbook:open-chat` window event (`openChat()` in `ChatAssistant.tsx`).

## Pieces

| File | Role |
| --- | --- |
| `components/chat/ChatAssistant.tsx` | Client UI: window, messages, quick-reply chips, input. Keeps the conversation state in a ref |
| `components/chat/actions.ts` | Server actions `chatReply(state, text)` and `chatGreeting()` |
| `lib/chatEngine.ts` | All logic. `reply(state, text)` returns `[nextState, botMessages]` |

The engine runs on the server, so it sees trains admins added and can create bookings. The client sends the
whole `ChatState` with each message. The server keeps no chat state between messages.

## Booking state machine

```mermaid
stateDiagram-v2
  [*] --> idle
  idle --> from: "book a ticket"
  idle --> train: "Mumbai to Delhi tomorrow"
  from --> to
  to --> date
  date --> train: searchTrains()
  train --> class
  class --> pax
  pax --> confirm
  confirm --> idle: "Confirm and pay" creates booking
  confirm --> idle: "Review on payment page" links to summary
  confirm --> class: "Change class"
```

`advance()` asks for whatever is still missing (from, to, date). A message like "from LTT to PRYJ on 5 dec"
fills all three at once and jumps straight to the train list.

## Understood input

| Input | Parser |
| --- | --- |
| Stations | Code (`MMCT`), name, city, or alias (`delhi`, `bombay`, `kolkata`, `banaras`...) via `findStation()` |
| Dates | today, tomorrow, day after tomorrow, `2026-11-30`, `30 nov`, `nov 30`, `30/11` via `parseDate()`. Past dates roll to next year |
| Train choice | List number (`1`), train number, or part of the name |
| Class | `3A`, `SL`, or the class name |
| Passengers | 1 to 6 |
| Any time | `PNR 2828538983`, `live status 12951`, `schedule 22177`, `help`, `start over` |

On "Confirm and pay" the engine calls `createBooking()` for the user's saved passengers (then "Passenger N")
and replies with the PNR, the status and a "View e-ticket" link.

## Adding an LLM later

Keep the UI and the server action. In `components/chat/actions.ts`, call the model first. Use tool calls
backed by the same functions (`searchTrains`, `getBookingByPnr`, `createBooking`), and fall back to
`reply()` if the model is unavailable. Keep the existing `ChatMessage` shape (`text`, `chips`, `link`).
