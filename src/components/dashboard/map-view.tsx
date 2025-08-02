import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Map } from 'lucide-react';
import { Badge } from '../ui/badge';

export function MapView() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="p-4 border-b flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 font-headline text-base">
          <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse"></div>
          UNIDAD DE ROBOT DE SEGUIMIENTO
        </CardTitle>
        <Badge variant="outline" className="border-green-500 text-green-400 bg-green-500/10">EN LÍNEA</Badge>
      </CardHeader>
      <div className="flex-grow min-h-64 p-4">
        <div className="w-full h-full rounded-lg overflow-hidden relative border-2 border-primary/50">
            <Image
                src="https://placehold.co/800x600.png"
                alt="Map view of the robot's location"
                fill
                className="object-cover"
                data-ai-hint="city map"
            />
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-5 h-5 bg-primary rounded-full animate-ping opacity-75"></div>
                <div className="absolute inset-0 m-auto w-4 h-4 bg-primary rounded-full border-2 border-background shadow-lg"></div>
            </div>
             <div className="absolute top-2 left-2 flex flex-col gap-1">
                <button className="w-8 h-8 flex items-center justify-center bg-card/80 backdrop-blur-sm border rounded-md text-xl font-bold hover:bg-card">+</button>
                <button className="w-8 h-8 flex items-center justify-center bg-card/80 backdrop-blur-sm border rounded-md text-xl font-bold hover:bg-card">-</button>
            </div>
        </div>
      </div>
    </Card>
  );
}
