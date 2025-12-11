import { SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import Link from "next/link"; // <-- Import Link
import { X } from "lucide-react"; // <-- Import X Icon
import { Button } from "@/components/ui/button"; // <-- Import Button

export default function Page() {
  return (
    // 'relative' class zaruri hai
    <div className="relative flex items-center justify-center min-h-screen bg-background p-4">
      
      {/* --- CLOSE BUTTON --- */}
      <div className="absolute top-4 right-4 md:top-8 md:right-8 z-10">
         <Link href="/" aria-label="Go back to home">
            <Button variant="outline" size="icon" className="rounded-full border-border/50 bg-background/50 backdrop-blur-sm hover:bg-accent/50 transition-all">
               <X className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
            </Button>
         </Link>
      </div>

      {/* Clerk Sign Up Component */}
      <SignUp 
        appearance={{
          baseTheme: dark,
          elements: {
            card: "bg-card border border-border/50 shadow-2xl backdrop-blur-xl",
            headerTitle: "text-foreground font-bold",
            headerSubtitle: "text-muted-foreground",
            socialButtonsBlockButton: "bg-muted/50 text-foreground border-border/50 hover:bg-muted transition-all",
            formFieldLabel: "text-foreground font-medium",
            formFieldInput: "bg-background/50 border-border/50 text-foreground focus:border-niti-blue transition-all",
            formButtonPrimary: "bg-niti-blue hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20",
            footerActionLink: "text-niti-blue hover:text-blue-500 font-medium",
            dividerLine: "bg-border/50",
            dividerText: "text-muted-foreground"
          }
        }}
      />
    </div>
  );
}