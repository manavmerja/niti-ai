import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="p-4">
        <SignIn 
            appearance={{
                elements: {
                    formButtonPrimary: "bg-niti-blue hover:bg-blue-600 text-sm normal-case",
                    card: "bg-card border border-border shadow-xl",
                    headerTitle: "text-foreground",
                    headerSubtitle: "text-muted-foreground",
                    socialButtonsBlockButton: "bg-muted text-foreground border-border hover:bg-muted/80",
                    formFieldLabel: "text-foreground",
                    formFieldInput: "bg-background border-border text-foreground",
                    footerActionLink: "text-niti-blue hover:text-blue-600"
                }
            }}
        />
      </div>
    </div>
  );
}