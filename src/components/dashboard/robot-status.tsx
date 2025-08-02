"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Battery, Wifi } from 'lucide-react';

export function RobotStatus() {
  const [battery, setBattery] = useState(78);
  const [signal, setSignal] = useState(92);
  const [status] = useState<'Inactivo' | 'Activo'>('Inactivo');

  useEffect(() => {
    const batteryInterval = setInterval(() => {
      setBattery((prev) => (prev > 10 ? prev - 1 : 80));
    }, 5000);
     const signalInterval = setInterval(() => {
      setSignal(Math.floor(Math.random() * 15) + 80); // 80-95
    }, 3000);
    return () => {
        clearInterval(batteryInterval);
        clearInterval(signalInterval);
    };
  }, []);
  
  const getProgressColor = (value: number) => {
    if (value > 75) return 'bg-green-500';
    if (value > 50) return 'bg-yellow-500';
    if (value > 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <Card>
      <CardHeader className="p-4 border-b flex flex-row items-center justify-between">
        <CardTitle className="font-headline text-base">ESTADO DEL ROBOT</CardTitle>
         <Badge variant={status === 'Activo' ? 'default' : 'secondary'} className={`${status === 'Activo' ? 'bg-green-400/20 text-green-300 border-green-400' : 'bg-gray-400/20 text-gray-300 border-gray-400'}`}>
            {status}
        </Badge>
      </CardHeader>
      <CardContent className="grid gap-6 p-4">
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                    <Battery className="h-5 w-5 text-primary" />
                    <span className="font-medium">BATERÍA</span>
                </div>
                <span className="text-muted-foreground">{battery}%</span>
            </div>
            <Progress value={battery} indicatorClassName={getProgressColor(battery)} className="h-3 bg-muted/30" />
        </div>
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                    <Wifi className="h-5 w-5 text-primary" />
                    <span className="font-medium">SEÑAL</span>
                </div>
                <span className="text-muted-foreground">{signal}%</span>
            </div>
             <Progress value={signal} indicatorClassName={getProgressColor(signal)} className="h-3 bg-muted/30" />
        </div>
      </CardContent>
    </Card>
  );
}
