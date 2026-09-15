import { Outlet } from "react-router-dom";
import { BabyProvider } from "../../context/BabyContext";
import { BabyProfileModalProvider } from "../../context/BabyProfileModalContext";
import { EventDetailModalProvider } from "../../context/EventDetailModalContext";
import { LogEventModalProvider } from "../../context/LogEventModalContext";
import BabyProfileModal from "../baby/BabyProfileModal";
import EditEventModal from "../events/EditEventModal";
import LogEventModal from "../events/LogEventModal";
import BabyPhotoBackground from "./BabyPhotoBackground";
import BottomNav from "./BottomNav";
import TopNav from "./TopNav";
import { useEffect, useState } from "react";
import { flushOfflineQueue } from "../../utils/offlineQueue";
import OnboardingModal from "../onboarding/OnboardingModal";

export default function AppShell() {
  const [online, setOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      void flushOfflineQueue();
    };
    const handleOffline = () => setOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    void flushOfflineQueue();
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <BabyProvider>
      <LogEventModalProvider>
        <EventDetailModalProvider>
          <BabyProfileModalProvider>
            <div className="relative flex min-h-screen flex-col bg-theme-page">
              <BabyPhotoBackground />
              <div className="relative z-10 flex min-h-screen flex-col">
                <TopNav />
                {!online && (
                  <div className="bg-amber-500 px-3 py-1 text-center text-xs font-semibold text-slate-950">
                    You are offline. New events will sync when connected.
                  </div>
                )}
                <main className="mx-auto w-full max-w-[90rem] flex-1 px-3 py-4 pb-24 lg:px-6 lg:pb-8">
                  <Outlet />
                </main>
                <BottomNav />
                <LogEventModal />
                <EditEventModal />
                <BabyProfileModal />
                <OnboardingModal />
              </div>
            </div>
          </BabyProfileModalProvider>
        </EventDetailModalProvider>
      </LogEventModalProvider>
    </BabyProvider>
  );
}
