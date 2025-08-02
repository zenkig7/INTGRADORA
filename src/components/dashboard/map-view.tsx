import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Map } from 'lucide-react';

export function MapView() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Map className="h-6 w-6" />
          Live Location
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow min-h-64">
        <div className="w-full h-full rounded-lg overflow-hidden relative border">
            <Image
                src="https://placehold.co/800x600.png"
                alt="Map view of the robot's location"
                fill
                className="object-cover"
                data-ai-hint="satellite map"
            />
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-4 h-4 bg-primary rounded-full animate-pulse border-2 border-primary-foreground shadow-lg"></div>
                <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping"></div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
