"use client";

import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Square, AlertTriangle, Home } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { sendCommand } from '@/services/firebase';

export function Controls() {
    const { toast } = useToast();

    const handleControlClick = async (action: string, params?: any) => {
        try {
            await sendCommand(action, params);
            toast({
                title: "Comando enviado",
                description: `Se ha emitido el comando '${action}' al robot.`,
            });
        } catch (error) {
            toast({
                title: "Error al enviar comando",
                description: "No se pudo comunicar con el robot.",
                variant: "destructive",
            });
            console.error("Failed to send command:", error);
        }
    };

    return (
        <Card>
            <CardHeader className="p-4 border-b">
                <CardTitle className="flex items-center gap-2 font-headline text-base">
                    MANDOS
                </CardTitle>
            </CardHeader>
            <div className="p-4 flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                    <Button size="lg" onClick={() => handleControlClick('start')} className="bg-green-600/20 text-green-400 border border-green-500 hover:bg-green-600/40">
                        <Play className="mr-2 h-5 w-5" /> Empezar
                    </Button>
                    <Button size="lg" variant="destructive" onClick={() => handleControlClick('stop')} className="bg-red-600/20 text-red-400 border border-red-500 hover:bg-red-600/40">
                        <Square className="mr-2 h-5 w-5" /> Parar
                    </Button>
                </div>
                 <Card className="mt-4">
                    <CardHeader className="p-4 border-b">
                        <CardTitle className="flex items-center gap-2 font-headline text-base text-red-400">
                             <AlertTriangle className="h-5 w-5" />
                            EMERGENCIA
                        </CardTitle>
                    </CardHeader>
                    <div className="p-4 flex flex-col gap-4">
                        <Button variant="destructive" size="lg" className="h-16 text-lg font-bold" onClick={() => handleControlClick('emergency_stop')}>
                            <AlertTriangle className="mr-2 h-6 w-6" /> PARADA DE EMERGENCIA
                        </Button>
                        <Button size="lg" onClick={() => handleControlClick('return_to_base')}>
                            <Home className="mr-2 h-5 w-5" /> Regreso a la Base
                        </Button>
                    </div>
                </Card>
            </div>
        </Card>
    );
}
