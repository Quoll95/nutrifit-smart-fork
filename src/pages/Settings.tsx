import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  User, 
  Target, 
  Bell, 
  Shield, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  Crown,
  Smartphone
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function Settings() {
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

  const settingsGroups = [
    {
      title: "Profilo",
      items: [
        { icon: User, title: "Informazioni personali", subtitle: "Peso, altezza, età", hasChevron: true },
        { icon: Target, title: "Obiettivi", subtitle: "Calorie e macro giornalieri", hasChevron: true },
        { icon: Crown, title: "Upgrade a Premium", subtitle: "Sblocca tutte le funzioni", hasChevron: true, isPremium: true },
      ]
    },
    {
      title: "Preferenze",
      items: [
        { icon: Bell, title: "Notifiche", subtitle: "Promemoria pasti e obiettivi", hasSwitch: true, enabled: true },
        { icon: Smartphone, title: "Sincronizzazione", subtitle: "Backup automatico dei dati", hasSwitch: true, enabled: false },
      ]
    },
    {
      title: "Supporto",
      items: [
        { icon: HelpCircle, title: "Centro assistenza", subtitle: "FAQ e guide", hasChevron: true },
        { icon: Shield, title: "Privacy e sicurezza", subtitle: "Gestisci i tuoi dati", hasChevron: true },
      ]
    }
  ];

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto">
      {/* User Profile Header */}
      <Card className="p-4 shadow-card">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center">
            <User className="w-8 h-8 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-foreground">{profile?.display_name || "Utente"}</h2>
            <p className="text-sm text-muted-foreground">{profile?.email}</p>
            <div className="flex items-center space-x-2 mt-1">
              <div className="px-2 py-1 bg-primary/10 rounded-full">
                <span className="text-xs text-primary font-medium">Piano Gratuito</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Settings Groups */}
      {settingsGroups.map((group, groupIndex) => (
        <Card key={groupIndex} className="p-4 shadow-card">
          <h3 className="font-semibold text-foreground mb-3">{group.title}</h3>
          <div className="space-y-1">
            {group.items.map((item, itemIndex) => (
              <div
                key={itemIndex}
                className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                  item.hasChevron ? 'hover:bg-muted/50 cursor-pointer' : ''
                } ${item.isPremium ? 'bg-gradient-primary/5 border border-primary/20' : ''}`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    item.isPremium 
                      ? 'bg-primary/20' 
                      : 'bg-muted/50'
                  }`}>
                    <item.icon className={`w-4 h-4 ${
                      item.isPremium 
                        ? 'text-primary' 
                        : 'text-muted-foreground'
                    }`} />
                  </div>
                  <div>
                    <p className={`font-medium text-sm ${
                      item.isPremium ? 'text-primary' : 'text-foreground'
                    }`}>
                      {item.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  {item.hasSwitch && (
                    <Switch defaultChecked={item.enabled} />
                  )}
                  {item.hasChevron && (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}

      {/* Stats Card */}
      <Card className="p-4 shadow-card bg-gradient-success/5">
        <h3 className="font-semibold text-foreground mb-3">Le tue statistiche</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-primary">15</p>
            <p className="text-xs text-muted-foreground">Giorni consecutivi</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-protein">1.2k</p>
            <p className="text-xs text-muted-foreground">Alimenti tracciati</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-carbs">-2.5kg</p>
            <p className="text-xs text-muted-foreground">Progresso peso</p>
          </div>
        </div>
      </Card>

      {/* Logout Button */}
      <Button 
        variant="outline" 
        size="lg" 
        className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={handleSignOut} 
        disabled={isLoading}
      >
        <LogOut className="w-4 h-4 mr-2" />
        {isLoading ? "Disconnessione..." : "Disconnetti"}
      </Button>
    </div>
  );
}