import ChatInterface from "@/components/niti/ChatInterface";
import { Suspense } from "react";
import { Loader2 } from "lucide-react"; // Loading icon

export default function Home() {
  return (
    // ✅ Suspense Boundary Added
    <Suspense
      fallback={
        <div className="flex h-full w-full items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <ChatInterface />
    </Suspense>
  );
}