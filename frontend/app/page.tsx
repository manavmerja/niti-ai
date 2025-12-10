"use client"

import MainLayout from "../components/layout/MainLayout";
import ChatInterface from "../components/niti/ChatInterface"; // Import kiya

export default function Page() {
  return (
    <MainLayout>
      {/* Ab "Initializing" ki jagah asli Chat App */}
      <ChatInterface />
    </MainLayout>
  );
}