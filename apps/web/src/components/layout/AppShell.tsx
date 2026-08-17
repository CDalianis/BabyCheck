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

export default function AppShell() {
  return (
    <BabyProvider>
      <LogEventModalProvider>
        <EventDetailModalProvider>
          <BabyProfileModalProvider>
            <div className="relative flex min-h-screen flex-col bg-theme-page">
              <BabyPhotoBackground />
              <div className="relative z-10 flex min-h-screen flex-col">
                <TopNav />
                <main className="mx-auto w-full max-w-[90rem] flex-1 px-3 py-4 pb-24 lg:px-6 lg:pb-8">
                  <Outlet />
                </main>
                <BottomNav />
                <LogEventModal />
                <EditEventModal />
                <BabyProfileModal />
              </div>
            </div>
          </BabyProfileModalProvider>
        </EventDetailModalProvider>
      </LogEventModalProvider>
    </BabyProvider>
  );
}
