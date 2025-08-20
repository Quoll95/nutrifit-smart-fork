import { NavLink, useLocation } from "react-router-dom";
import { 
  Home,
  BookOpen,
  Plus,
  Bluetooth,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Dashboard", path: "/" },
  { icon: BookOpen, label: "Diario", path: "/diary" },
  { icon: Plus, label: "Aggiungi", path: "/add", isMain: true },
  { icon: Bluetooth, label: "Dispositivi", path: "/devices" },
  { icon: Settings, label: "Impostazioni", path: "/settings" },
];

export const BottomNavigation = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border/50 px-4 py-2">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map(({ icon: Icon, label, path, isMain }) => {
          const isActive = location.pathname === path;
          
          return (
            <NavLink
              key={path}
              to={path}
              className={cn(
                "flex flex-col items-center py-2 px-3 rounded-xl transition-all",
                isMain && "relative -top-4 p-4 bg-gradient-primary shadow-glow rounded-full",
                !isMain && isActive && "bg-primary/10",
                !isMain && !isActive && "hover:bg-muted/50"
              )}
            >
              <Icon 
                className={cn(
                  "w-6 h-6 transition-colors",
                  isMain && "text-primary-foreground w-7 h-7",
                  !isMain && isActive && "text-primary",
                  !isMain && !isActive && "text-muted-foreground"
                )} 
              />
              <span 
                className={cn(
                  "text-xs mt-1 transition-colors",
                  isMain && "text-primary-foreground font-medium",
                  !isMain && isActive && "text-primary font-medium",
                  !isMain && !isActive && "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};