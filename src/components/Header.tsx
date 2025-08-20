import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Header = () => {
  const { signOut } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
      toast({
        title: "Disconnesso",
        description: "Sei stato disconnesso con successo",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Errore durante la disconnessione",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = () => {
    const today = new Date();
    return today.toLocaleDateString('it-IT', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <header className="bg-card/80 backdrop-blur-sm border-b border-border/50 px-4 py-3 sticky top-0 z-10">
      <div className="flex justify-between items-center max-w-md mx-auto">
        <div>
          <h1 className="text-lg font-semibold text-foreground">CaloryTracker</h1>
          <p className="text-sm text-muted-foreground">{formatDate()}</p>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="w-10 h-10 ring-2 ring-primary/20 cursor-pointer hover:ring-primary/40 transition-all">
              <AvatarImage src={profile?.avatar_url || "/profile-placeholder.jpg"} alt="Profilo" />
              <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                <User className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-3 py-2">
              <p className="text-sm font-medium text-foreground">
                {profile?.display_name || "Utente"}
              </p>
              <p className="text-xs text-muted-foreground">
                {profile?.email}
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleSignOut} 
              disabled={isLoading}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {isLoading ? "Disconnessione..." : "Disconnetti"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};