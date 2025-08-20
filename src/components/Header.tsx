import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

export const Header = () => {
  return (
    <header className="bg-card/80 backdrop-blur-sm border-b border-border/50 px-4 py-3 sticky top-0 z-10">
      <div className="flex justify-between items-center max-w-md mx-auto">
        <div>
          <h1 className="text-lg font-semibold text-foreground">CaloryTracker</h1>
          <p className="text-sm text-muted-foreground">Oggi, 20 Agosto</p>
        </div>
        
        <Avatar className="w-10 h-10 ring-2 ring-primary/20 cursor-pointer hover:ring-primary/40 transition-all">
          <AvatarImage src="/profile-placeholder.jpg" alt="Profilo" />
          <AvatarFallback className="bg-gradient-primary text-primary-foreground">
            <User className="w-5 h-5" />
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};