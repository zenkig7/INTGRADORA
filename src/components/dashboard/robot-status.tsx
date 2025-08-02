"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BatteryFull, Signal, Bot } from 'lucide-react';

export function RobotStatus() {
  const [battery, setBattery] = useState(88);
  const [signal, setSignal] = useState(76);
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');

  useEffect(() => {
    const interval = setInterval(() => {
      setBattery((prev) => (prev > 10 ? prev - 1 : 100));
      setSignal(Math.floor(Math.random() * 21) + 75); // 75-95
      if (Math.random() > 0.95) {
        setStatus(prev => prev === 'Active' ? 'Inactive' : 'Active');
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Bot className="h-6 w-6" />
          Robot Status
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BatteryFull className="h-6 w-6 text-primary" />
            <span className="font-medium">Battery</span>
          </div>
          <div className="flex items-center gap-3 w-2/5">
            <Progress value={battery} className="h-3" />
            <span className="text-sm text-muted-foreground w-12 text-right">{battery}%</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Signal className="h-6 w-6 text-primary" />
            <span className="font-medium">Signal</span>
          </div>
          <div className="flex items-center gap-3 w-2/5">
            <Progress value={signal} className="h-3" />
            <span className="text-sm text-muted-foreground w-12 text-right">{signal}%</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-medium">Status</span>
          <Badge variant="outline" className="border-transparent text-sm">
              <div className={`h-2.5 w-2.5 rounded-full mr-2 ${status === 'Active' ? 'bg-primary' : 'bg-muted-foreground'}`}></div>
              {status}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
