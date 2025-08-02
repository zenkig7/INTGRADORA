import { DashboardHeader } from '@/components/dashboard/header';
import { RobotStatus } from '@/components/dashboard/robot-status';
import { Controls } from '@/components/dashboard/controls';
import { MapView } from '@/components/dashboard/map-view';
import { DestinationManager } from '@/components/dashboard/destination-manager';
import { RouteOptimizer } from '@/components/dashboard/route-optimizer';

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <DashboardHeader />
      <main className="flex-1 p-4 md:p-6 lg:p-8 grid gap-8 grid-cols-1 xl:grid-cols-4">
        <div className="xl:col-span-1 flex flex-col gap-8">
          <RobotStatus />
          <Controls />
        </div>
        
        <div className="xl:col-span-2 flex flex-col gap-8">
          <MapView />
          <RouteOptimizer />
        </div>
        
        <div className="xl:col-span-1 flex flex-col gap-8">
          <DestinationManager />
        </div>
      </main>
    </div>
  );
}
