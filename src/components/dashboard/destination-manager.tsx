"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MapPin, Send, Trash2, PlusCircle, ChevronDown } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Badge } from '../ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';

interface Destination {
  id: number;
  name: string;
  description: string;
  lat: number;
  lng: number;
  active?: boolean;
}

const initialDestinations: Destination[] = [
    { id: 1, name: "Punto A", description: "Entrada principal", lat: 19.4326, lng: -99.1332 },
    { id: 2, name: "Punto B", description: "Área de carga", lat: 19.4340, lng: -99.1310, active: true },
];

export function DestinationManager() {
    const [destinations, setDestinations] = useState<Destination[]>(initialDestinations);
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

    const handleDelete = (id: number) => {
        setDestinations(destinations.filter(d => d.id !== id));
        toast({ title: "Éxito", description: "Destino eliminado." });
    }

    const handleSend = (name: string) => {
        toast({ title: "Comando Enviado", description: `Enviando robot a ${name}.` });
    }

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="p-4 border-b">
                <CardTitle className="flex items-center gap-2 font-headline text-base">
                    <MapPin className="h-5 w-5" />
                    DESTINOS GUARDADOS
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex flex-col gap-4 flex-grow min-h-0">
                <ScrollArea className="flex-grow pr-2 -mr-2">
                    <div className="space-y-4">
                        {destinations.map(dest => (
                            <Card key={dest.id} className="p-4 flex flex-col gap-2 bg-card/50 border-primary/20">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold text-primary">{dest.name}</p>
                                        {dest.active && <Badge className="bg-green-400/20 text-green-300 border-green-400 text-xs">ACTIVO</Badge>}
                                    </div>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10 hover:text-primary" onClick={() => handleSend(dest.name)}>
                                            <Send className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:bg-red-500/10 hover:text-red-400" onClick={() => handleDelete(dest.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground">{dest.description}</p>
                                <p className="text-xs text-muted-foreground">{`${dest.lat}, ${dest.lng}`}</p>
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
