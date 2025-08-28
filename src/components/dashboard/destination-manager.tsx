"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MapPin, Send, Trash2, PlusCircle, ChevronDown, Route, Palette } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Badge } from '../ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { sendCommand } from '@/services/firebase';

interface Destination {
  id: number;
  name: string;
  description: string;
  lat: number;
  lng: number;
}

interface Route {
    id: number;
    name: string;
    description: string;
    path: [number, number][];
}

const initialDestinations: Destination[] = [
    { id: 1, name: "Base", description: "Punto de carga y estacionamiento", lat: 25.9231526, lng: -97.5892535 },
    { id: 2, name: "Punto de Entrega A", description: "Entrada principal", lat: 25.9240, lng: -97.5880 },
    { id: 3, name: "Biblioteca", description: "Centro de recursos", lat: 25.9225, lng: -97.5900 },
    { id: 4, name: "Laboratorios", description: "Edificio de ciencias", lat: 25.9215, lng: -97.5895 },
];

const initialRoutes: Route[] = [
    {
        id: 101,
        name: "Ruta a Laboratorios",
        description: "Camino de concreto desde la Base hasta los Laboratorios.",
        path: [
            [25.9231526, -97.5892535], // Base
            [25.9229, -97.5894],
            [25.9220, -97.5890],
            [25.9215, -97.5895] // Laboratorios
        ]
    },
     {
        id: 102,
        name: "Ruta de Concreto Principal",
        description: "Ruta extraída de Google Earth, sigue los caminos de concreto.",
        path: [
            [25.923154, -97.589220],
            [25.923149, -97.589013],
            [25.922292, -97.589035],
            [25.921788, -97.589034],
            [25.921785, -97.588204],
            [25.921962, -97.588204],
            [25.921785, -97.588345],
            [25.921594, -97.588349],
            [25.921787, -97.588641],
            [25.920795, -97.588645],
            [25.920783, -97.588193],
            [25.920674, -97.588193],
            [25.920813, -97.589345],
            [25.921015, -97.589342],
            [25.921599, -97.589310],
            [25.921792, -97.589308],
            [25.921794, -97.589467],
            [25.921977, -97.589461],
        ]
    }
];


export function DestinationManager({ onSelectDestination, onSelectRoute, onClear }: { onSelectDestination: (dest: Destination) => void, onSelectRoute: (route: Route) => void, onClear: () => void }) {
    const [destinations, setDestinations] = useState<Destination[]>(initialDestinations);
    const [routes, setRoutes] = useState<Route[]>(initialRoutes);
    const [newDestName, setNewDestName] = useState('');
    const [newDestDesc, setNewDestDesc] = useState('');
    const [newDestLat, setNewDestLat] = useState('');
    const [newDestLng, setNewDestLng] = useState('');
    const { toast } = useToast();
    const [isAddOpen, setIsAddOpen] = useState(false);

    const handleAddDestination = () => {
        if (!newDestName || !newDestLat || !newDestLng) {
            toast({ title: "Error", description: "Por favor, rellene todos los campos requeridos.", variant: "destructive" });
            return;
        }
        const newDestination: Destination = {
            id: Date.now(),
            name: newDestName,
            description: newDestDesc,
            lat: parseFloat(newDestLat),
            lng: parseFloat(newDestLng),
        };
        setDestinations([newDestination, ...destinations]);
        setNewDestName('');
        setNewDestDesc('');
        setNewDestLat('');
        setNewDestLng('');
        toast({ title: "Éxito", description: "Nuevo destino añadido." });
    };

    const handleDeleteDestination = (id: number) => {
        setDestinations(destinations.filter(d => d.id !== id));
        toast({ title: "Éxito", description: "Destino eliminado." });
    }
    
    const handleDeleteRoute = (id: number) => {
        setRoutes(routes.filter(r => r.id !== id));
        toast({ title: "Éxito", description: "Ruta eliminada." });
    }

    const handleSendCommand = async (type: 'destination' | 'route', item: Destination | Route) => {
        try {
            const command = type === 'destination' ? 'go_to_destination' : 'follow_route';
            const params = type === 'destination' 
                ? { name: item.name, lat: (item as Destination).lat, lng: (item as Destination).lng } 
                : { name: item.name, path: (item as Route).path };

            await sendCommand(command, params);

            toast({ title: "Comando Enviado", description: `Enviando robot a ${item.name}.` });
            
            if (type === 'destination') {
                onSelectDestination(item as Destination);
            } else {
                onSelectRoute(item as Route);
            }

        } catch (error) {
             toast({
                title: "Error al enviar comando",
                description: "No se pudo comunicar con el robot.",
                variant: "destructive",
            });
            console.error("Failed to send command:", error);
        }
    }


    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="p-4 border-b">
                <CardTitle className="flex items-center gap-2 font-headline text-base">
                    <Route className="h-5 w-5" />
                    PLANIFICADOR DE RUTA
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex flex-col gap-4 flex-grow min-h-0">
                <div className="flex justify-between items-center">
                    <Button onClick={onClear} variant="outline" size="sm">
                        <Trash2 className="mr-2 h-4 w-4" /> Limpiar Ruta del Mapa
                    </Button>
                </div>
                <ScrollArea className="flex-grow pr-2 -mr-2">
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-primary/80 flex items-center gap-2 mt-4"><MapPin className="h-4 w-4"/> DESTINOS</h3>
                        {destinations.map(dest => (
                            <Card key={dest.id} className="p-3 flex flex-col gap-2 bg-card/50 border-primary/20">
                                <div className="flex justify-between items-start">
                                     <p className="font-semibold text-primary">{dest.name}</p>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10 hover:text-primary" onClick={() => handleSendCommand('destination', dest)}>
                                            <Send className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:bg-red-500/10 hover:text-red-400" onClick={() => handleDeleteDestination(dest.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground">{dest.description}</p>
                                <p className="text-xs text-muted-foreground">{`${dest.lat}, ${dest.lng}`}</p>
                            </Card>
                        ))}

                        <h3 className="text-sm font-semibold text-primary/80 flex items-center gap-2 mt-6"><Palette className="h-4 w-4"/> RUTAS GUARDADAS</h3>
                         {routes.map(route => (
                            <Card key={route.id} className="p-3 flex flex-col gap-2 bg-card/50 border-primary/20">
                                <div className="flex justify-between items-start">
                                     <p className="font-semibold text-primary">{route.name}</p>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10 hover:text-primary" onClick={() => handleSendCommand('route', route)}>
                                            <Send className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:bg-red-500/10 hover:text-red-400" onClick={() => handleDeleteRoute(route.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground">{route.description}</p>
                                <p className="text-xs text-muted-foreground">{route.path.length} Puntos de Ruta</p>
                            </Card>
                        ))}
                    </div>
                </ScrollArea>
                <Collapsible open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <CollapsibleTrigger asChild>
                         <Button variant="outline" className="w-full justify-between mt-4">
                            <span className="flex items-center gap-2"><PlusCircle className="h-5 w-5"/>AGREGAR DESTINO</span>
                            <ChevronDown className={`h-5 w-5 transition-transform ${isAddOpen ? 'rotate-180' : ''}`} />
                        </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-4 p-4 border rounded-md">
                         <div className="grid gap-2">
                            <Input value={newDestName} onChange={(e) => setNewDestName(e.target.value)} placeholder="Nombre" />
                            <Textarea value={newDestDesc} onChange={(e) => setNewDestDesc(e.target.value)} placeholder="Descripción"/>
                            <div className="grid grid-cols-2 gap-2">
                                <Input type="number" value={newDestLat} onChange={(e) => setNewDestLat(e.target.value)} placeholder="Latitud" />
                                <Input type="number" value={newDestLng} onChange={(e) => setNewDestLng(e.target.value)} placeholder="Longitud" />
                            </div>
                            <Button onClick={handleAddDestination} className="w-full">Agregar</Button>
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            </CardContent>
        </Card>
    );
}
