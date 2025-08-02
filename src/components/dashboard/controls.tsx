"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Square, AlertTriangle, Home, Zap } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export function Controls() {
    const { toast } = useToast();

    const handleControlClick = (action: string) => {
        toast({
            title: "Command Sent",
            description: `Robot ${action} command issued.`,
        });
        console.log(`Command sent: ${action}`);
    };

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <Zap className="h-6 w-6" />
                    Controls
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                    <Button size="lg" onClick={() => handleControlClick('start')}>
                        <Play className="mr-2 h-5 w-5" /> Start
                    </Button>
                    <Button size="lg" variant="secondary" onClick={() => handleControlClick('stop')}>
                        <Square className="mr-2 h-5 w-5" /> Stop
                    </Button>
                </div>
                <Button size="lg" onClick={() => handleControlClick('return to base')}>
                    <Home className="mr-2 h-5 w-5" /> Return to Base
                </Button>
                <Button variant="destructive" size="lg" className="h-16 text-lg font-bold" onClick={() => handleControlClick('emergency stop')}>
                    <AlertTriangle className="mr-2 h-6 w-6" /> EMERGENCY STOP
                </Button>
            </CardContent>
        </Card>
    );
}
