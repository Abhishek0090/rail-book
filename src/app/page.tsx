import Link from "next/link";
import {
  ArrowRight,
  BadgePercent,
  Bot,
  CalendarClock,
  Clock,
  CreditCard,
  Headphones,
  MapPin,
  MessageCircle,
  Search,
  ShieldCheck,
  Ticket,
  TrainFront,
  Utensils,
  Zap,
} from "lucide-react";
import FeaturesCard from "@/components/common/FeaturesCard";
import HeroSearch from "@/components/home/HeroSearch";
import TrainTrack from "@/components/home/TrainTrack";
import OpenChatButton from "@/components/chat/OpenChatButton";
import { FEATURES } from "@/constants/features";
import { STATIONS, getStation } from "@/constants/stations";
import {
  formatDuration,
  POPULAR_ROUTES,
  searchTrains,
  TRAINS,
} from "@/data/trains";
import { format } from "date-fns";

const TRUST = [
  { icon: ShieldCheck, label: "Secure payments" },
  { icon: Zap, label: "Instant refunds" },
  { icon: Headphones, label: "24x7 support" },
  { icon: BadgePercent, label: "Zero UPI charges" },
];

const SERVICES = [
  { href: "/pnr", label: "PNR Status", desc: "Check booking status", icon: Ticket },
  { href: "/train/running-status", label: "Live Status", desc: "Where is my train", icon: MapPin },
  { href: "/train/schedule", label: "Train Schedule", desc: "Stops and timings", icon: CalendarClock },
  { href: "/booking/trips", label: "My Trips", desc: "Upcoming journeys", icon: TrainFront },
];

const OFFERS = [
  {
    code: "RAIL50",
    title: "Rs 50 off your first booking",
    desc: "Apply at checkout on any class.",
  },
  {
    code: "UPI0",
    title: "Zero payment gateway fee",
    desc: "Pay with UPI and save on every ticket.",
  },
  {
    code: "TATKAL",
    title: "Tatkal reminders",
    desc: "Get notified when Tatkal booking opens.",
  },
];

const STEPS = [
  { icon: Search, title: "Search trains", desc: "Pick stations and a date, or just ask the chat assistant." },
  { icon: Clock, title: "Choose class and seats", desc: "See live availability, fares and confirmation chances." },
  { icon: CreditCard, title: "Pay and travel", desc: "Pay with UPI, card or wallet. Your e-ticket arrives instantly." },
];

const FAQS = [
  {
    q: "How do I book a train ticket on RailBook?",
    a: "Search with your stations and date, pick a train and class, add passengers and pay. You can also type something like 'Mumbai to Delhi tomorrow' in the chat assistant.",
  },
  {
    q: "What do AVL, RAC and WL mean?",
    a: "AVL means seats are available. RAC (Reservation Against Cancellation) lets you board with a shared berth. WL is the waitlist position; it may confirm as others cancel.",
  },
  {
    q: "How do I check my PNR status?",
    a: "Open PNR Status and enter the 10 digit PNR printed on your ticket, or ask the chat assistant 'PNR' followed by the number.",
  },
  {
    q: "Can I cancel and get a refund?",
    a: "Yes. With free cancellation you get a full refund. Otherwise standard railway cancellation charges apply.",
  },
];

export default function Home() {
  const today = new Date();
  const routes = POPULAR_ROUTES.map((r) => {
    const results = searchTrains(r.from, r.to, today);
    const fares = results.flatMap((t) => t.seats.map((s) => s.price));
    return {
      ...r,
      trains: results.length,
      fromFare: fares.length ? Math.min(...fares) : null,
      fastest: results.length
        ? formatDuration(Math.min(...results.map((t) => t.durationMin)))
        : null,
    };
  });

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-gradient-soft px-4 pt-14 pb-32">
        {/* Rails and a running train along the bottom edge */}
        <TrainTrack />

        <div className="relative mx-auto flex max-w-5xl flex-col items-center">
          <span className="flex items-center gap-2 rounded-full border border-grape-200 bg-white/70 px-3 py-1 text-xs font-medium text-grape-700">
            <TrainFront size={14} /> {TRAINS.length} trains - {STATIONS.length} stations - book in under a minute
          </span>
          <h1 className="mt-5 text-center text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Your journey starts with{" "}
            <span className="text-brand-gradient">RailBook</span>
          </h1>
          <p className="mt-3 max-w-2xl text-center text-gray-600">
            Search trains, check live seat availability and confirm your ticket
            in a few taps, or let the assistant book it for you in chat.
          </p>

          <div className="mt-8 w-full">
            <div className="flex justify-center">
              <HeroSearch stations={[...STATIONS]} />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-gray-600">
            {TRUST.map(({ icon: Icon, label }) => (
              <span key={label} className="flex items-center gap-1.5">
                <Icon size={16} className="text-brand-600" /> {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Quick services */}
      <section className="relative mx-auto max-w-6xl px-4 pt-10">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {SERVICES.map(({ href, label, desc, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 group-hover:bg-brand-gradient group-hover:text-white">
                <Icon size={20} />
              </span>
              <p className="mt-3 font-semibold text-gray-900">{label}</p>
              <p className="text-xs text-gray-500">{desc}</p>
            </Link>
          ))}
          <OpenChatButton className="group col-span-2 rounded-2xl bg-brand-gradient p-4 text-left text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md md:col-span-1">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
              <Bot size={20} />
            </span>
            <p className="mt-3 font-semibold">Book via Chat</p>
            <p className="text-xs text-white/75">Type where and when</p>
          </OpenChatButton>
        </div>
      </section>

      {/* Popular routes */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Popular routes</h2>
            <p className="text-sm text-gray-500">
              Fares and trains for {format(today, "EEE, dd MMM")}
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {routes.map((r) => (
            <Link
              key={`${r.from}-${r.to}`}
              href={`/booking/search?from=${r.from}&to=${r.to}&date=${format(today, "yyyy-MM-dd")}`}
              className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-grape-300 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">{r.from}</p>
                  <p className="font-semibold">{getStation(r.from)?.city}</p>
                </div>
                <div className="flex flex-1 items-center px-3 text-brand-300">
                  <span className="h-px flex-1 bg-current" />
                  <TrainFront size={16} className="mx-1 text-grape-500" />
                  <span className="h-px flex-1 bg-current" />
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">{r.to}</p>
                  <p className="font-semibold">{getStation(r.to)?.city}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  {r.trains} train{r.trains === 1 ? "" : "s"}
                  {r.fastest && ` - from ${r.fastest}`}
                </span>
                {r.fromFare && (
                  <span className="font-semibold text-brand-700">
                    from Rs {r.fromFare}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Offers */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-6 text-2xl font-bold tracking-tight">Offers for you</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {OFFERS.map((o, i) => (
              <div
                key={o.code}
                className={`relative overflow-hidden rounded-2xl p-6 ${
                  i === 0
                    ? "bg-brand-gradient text-white"
                    : "border border-gray-200 bg-gradient-to-br from-brand-50 to-grape-50"
                }`}
              >
                <p className={`text-lg font-semibold ${i === 0 ? "" : "text-gray-900"}`}>
                  {o.title}
                </p>
                <p className={`mt-1 text-sm ${i === 0 ? "text-white/80" : "text-gray-600"}`}>
                  {o.desc}
                </p>
                <span
                  className={`mt-4 inline-block rounded-lg border border-dashed px-3 py-1 font-mono text-sm ${
                    i === 0
                      ? "border-amber-300 text-amber-300"
                      : "border-grape-400 text-grape-700"
                  }`}
                >
                  {o.code}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="mb-8 text-center text-2xl font-bold tracking-tight">
          Book in three steps
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, desc }, i) => (
            <div key={title} className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-gradient text-white">
                <Icon size={22} />
              </span>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-grape-600">
                Step {i + 1}
              </p>
              <p className="mt-1 font-semibold">{title}</p>
              <p className="mt-1 text-sm text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Chat CTA */}
      <section className="mx-auto mb-16 max-w-6xl px-4">
        <div className="flex flex-col items-center gap-6 rounded-3xl bg-brand-gradient-dark p-8 text-white md:flex-row md:p-10">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-amber-300">
            <MessageCircle size={32} />
          </span>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold">Book a ticket by chatting</h2>
            <p className="mt-1 text-white/75">
              Tell the assistant where and when. It finds trains, checks
              availability and takes you straight to payment.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <OpenChatButton
              message="Mumbai to Delhi tomorrow"
              className="flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-3 font-semibold text-slate-900 hover:bg-amber-300"
            >
              Try &quot;Mumbai to Delhi tomorrow&quot; <ArrowRight size={16} />
            </OpenChatButton>
          </div>
        </div>
      </section>

      {/* Why RailBook */}
      <section className="bg-white py-16">
        <FeaturesCard heading="Why book with RailBook?" features={FEATURES} />
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-16">
        <h2 className="mb-6 text-center text-2xl font-bold tracking-tight">
          Frequently asked questions
        </h2>
        <div className="space-y-3">
          {FAQS.map((f) => (
            <details
              key={f.q}
              className="group rounded-xl border border-gray-200 bg-white p-4 open:border-brand-200 open:shadow-sm"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
                {f.q}
                <span className="text-grape-500 transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-2 text-sm text-gray-600">{f.a}</p>
            </details>
          ))}
        </div>
        <p className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
          <Utensils size={14} /> Food delivery, Tatkal alerts and more coming soon.
        </p>
      </section>
    </main>
  );
}
