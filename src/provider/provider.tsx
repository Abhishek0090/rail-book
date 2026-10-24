import Navbar, { type NavUser } from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ChatAssistant from "@/components/chat/ChatAssistant";
import ServiceWorker from "@/components/pwa/ServiceWorker";
import React from "react";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "react-hot-toast";
import type { Theme } from "@/lib/theme";

const BRAND = "#7c3aed";

const Provider = ({
  children,
  theme,
  user,
}: {
  children: React.ReactNode;
  theme: Theme;
  user: NavUser;
}) => {
  return (
    <div className="flex min-h-screen flex-col">
      <NextTopLoader
        color={BRAND}
        initialPosition={0.08}
        crawlSpeed={200}
        height={3}
        crawl={true}
        showSpinner={false}
        easing="ease"
        speed={200}
        shadow={`0 0 10px ${BRAND},0 0 5px ${BRAND}`}
        zIndex={1600}
        showAtBottom={false}
      />
      <Toaster
        position="top-center"
        toastOptions={{
          style: { background: "var(--card)", color: "var(--card-foreground)" },
        }}
      />
      <Navbar theme={theme} user={user} />
      <div className="flex-1">{children}</div>
      <Footer />
      <ChatAssistant />
      <ServiceWorker />
    </div>
  );
};

export default Provider;
