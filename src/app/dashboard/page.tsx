import { DashboardHeader } from '@/components/dashboard/header';
import { RobotStatus } from '@/components/dashboard/robot-status';
import { Controls } from '@/components/dashboard/controls';
import { MapView } from '@/components/dashboard/map-view';
import { DestinationManager } from '@/components/dashboard/destination-manager';
import { ShieldQuestion } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <DashboardHeader />
      <main className="flex-1 grid gap-4 p-4 lg:grid-cols-12 lg:gap-6">
        <div className="lg:col-span-3 flex flex-col gap-6">
          <RobotStatus />
          <Controls />
        </div>
        
        <div className="lg:col-span-6 flex flex-col gap-6">
          <MapView />
        </div>
        
        <div className="lg:col-span-3 flex flex-col gap-6">
          <DestinationManager />
        </div>

        <div className="lg:col-span-12">
            <Card>
                <CardHeader className="p-4 border-b">
                    <CardTitle className="flex items-center gap-2 font-headline text-base">
                        <ShieldQuestion className="h-5 w-5" />
                        PROTOCOLO DE SEGURIDAD
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">
                        Conéctese a <span className="text-primary font-semibold">SUPABASE</span> para una autenticación completa de usuarios y un control de acceso seguro.
                    </p>
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
