import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bluetooth, 
  BluetoothConnected, 
  Utensils, 
  Scale, 
  Watch,
  Plus,
  Settings,
  Battery
} from "lucide-react";

export default function Devices() {
  const connectedDevices = [
    {
      name: "Smart Fork Pro",
      type: "Forchetta Smart",
      status: "connected",
      battery: 85,
      lastSync: "2 minuti fa"
    }
  ];

  const availableDevices = [
    {
      name: "Smart Plate",
      type: "Piatto intelligente",
      description: "Pesa automaticamente il cibo",
      icon: Scale,
      available: false
    },
    {
      name: "Fitness Watch",
      type: "Smartwatch",
      description: "Sincronizza calorie bruciate",
      icon: Watch,
      available: true
    },
    {
      name: "Smart Cup",
      type: "Bicchiere intelligente",
      description: "Monitora l'idratazione",
      icon: Utensils,
      available: false
    }
  ];

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">I tuoi dispositivi</h1>
        <p className="text-muted-foreground text-sm">
          Connetti dispositivi smart per il tracking automatico
        </p>
      </div>

      {/* Connected Devices */}
      <Card className="p-4 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Dispositivi connessi</h3>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            {connectedDevices.length} attivo
          </Badge>
        </div>

        {connectedDevices.length > 0 ? (
          <div className="space-y-3">
            {connectedDevices.map((device, index) => (
              <div key={index} className="p-3 rounded-lg border border-border bg-primary/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <BluetoothConnected className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{device.name}</p>
                      <p className="text-xs text-muted-foreground">{device.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1 mb-1">
                      <Battery className="w-3 h-3 text-primary" />
                      <span className="text-xs text-primary">{device.battery}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{device.lastSync}</p>
                  </div>
                </div>
                
                <div className="flex space-x-2 mt-3">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Settings className="w-3 h-3 mr-1" />
                    Configura
                  </Button>
                  <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
                    Disconnetti
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <Bluetooth className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">Nessun dispositivo connesso</p>
          </div>
        )}
      </Card>

      {/* Available Devices */}
      <Card className="p-4 shadow-card">
        <h3 className="font-semibold text-foreground mb-4">Dispositivi disponibili</h3>
        
        <div className="space-y-3">
          {availableDevices.map((device, index) => (
            <div key={index} className="p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-muted/50">
                    <device.icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{device.name}</p>
                    <p className="text-xs text-muted-foreground">{device.type}</p>
                    <p className="text-xs text-muted-foreground mt-1">{device.description}</p>
                  </div>
                </div>
                
                {device.available ? (
                  <Button size="sm" variant="outline" className="text-primary">
                    <Plus className="w-3 h-3 mr-1" />
                    Connetti
                  </Button>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    Presto disponibile
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Smart Fork Feature Highlight */}
      <Card className="p-4 shadow-card bg-gradient-primary/5 border-primary/20">
        <div className="text-center">
          <Utensils className="w-12 h-12 text-primary mx-auto mb-3" />
          <h3 className="font-semibold text-foreground mb-2">Smart Fork Pro</h3>
          <p className="text-sm text-muted-foreground mb-4">
            La forchetta intelligente che riconosce automaticamente gli alimenti e traccia 
            i nutrienti mentre mangi.
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-4">
            <div>✓ Riconoscimento automatico cibi</div>
            <div>✓ Connessione Bluetooth</div>
            <div>✓ Batteria 30 giorni</div>
            <div>✓ Resistente all'acqua</div>
          </div>
          <Button className="bg-gradient-primary shadow-glow w-full" size="sm">
            Ordina ora - €299
          </Button>
        </div>
      </Card>
    </div>
  );
}