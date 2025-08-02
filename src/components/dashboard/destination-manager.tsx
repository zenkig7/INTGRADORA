"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { MapPin, Send, Trash2, PlusCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface Destination {
  id: number;
  name: string;
  description: string;
  lat: number;
  lng: number;
}

const initialDestinations: Destination[] = [
    { id: 1, name: "Warehouse A", description: "Main pickup point.", lat: 34.0522, lng: -118.2437 },
    { id: 2, name: "Client HQ", description: "Primary delivery address.", lat: 34.0567, lng: -118.2512 },
    { id: 3, name: "Recharge Station", description: "Mid-route charging.", lat: 34.0488, lng: -118.2455 },
];

export function DestinationManager() {
    const [destinations, setDestinations] = useState<Destination[]>(initialDestinations);
    const [newDestName, setNewDestName] = useState('');
    const [newDestDesc, setNewDestDesc] = useState('');
    const [newDestLat, setNewDestLat] = useState('');
    const [newDestLng, setNewDestLng] = useState('');
    const { toast } = useToast();

    const handleAddDestination = () => {
        if (!newDestName || !newDestLat || !newDestLng) {
            toast({ title: "Error", description: "Please fill all required fields.", variant: "destructive" });
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
        toast({ title: "Success", description: "New destination added." });
    };

    const handleDelete = (id: number) => {
        setDestinations(destinations.filter(d => d.id !== id));
        toast({ title: "Success", description: "Destination removed." });
    }

    const handleSend = (name: string) => {
        toast({ title: "Command Sent", description: `Sending robot to ${name}.` });
    }

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <MapPin className="h-6 w-6" />
                    Destinations
                </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 flex-grow min-h-0">
                <div className="grid gap-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2"><PlusCircle className="h-5 w-5"/>Add Destination</h3>
                    <div className="grid gap-2">
                        <Label htmlFor="dest-name">Name</Label>
                        <Input id="dest-name" value={newDestName} onChange={(e) => setNewDestName(e.target.value)} placeholder="e.g., Downtown Dropoff" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="dest-desc">Description</Label>
                        <Textarea id="dest-desc" value={newDestDesc} onChange={(e) => setNewDestDesc(e.target.value)} placeholder="Optional description"/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="dest-lat">Latitude</Label>
                            <Input id="dest-lat" type="number" value={newDestLat} onChange={(e) => setNewDestLat(e.target.value)} placeholder="34.0522" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="dest-lng">Longitude</Label>
                            <Input id="dest-lng" type="number" value={newDestLng} onChange={(e) => setNewDestLng(e.target.value)} placeholder="-118.2437" />
                        </div>
                    </div>
                    <Button onClick={handleAddDestination}>Add Destination</Button>
                </div>

                <Separator />
                
                <div className="flex flex-col gap-4 min-h-0 flex-grow">
                    <h3 className="font-semibold text-lg">Saved Destinations</h3>
                    <ScrollArea className="flex-grow pr-4 -mr-4">
                        <div className="space-y-4">
                            {destinations.map(dest => (
                                <Card key={dest.id} className="p-4 flex flex-col gap-2 bg-background/50">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold">{dest.name}</p>
                                            <p className="text-sm text-muted-foreground">{dest.description}</p>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleSend(dest.name)}>
                                                <Send className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/80 hover:text-destructive" onClick={() => handleDelete(dest.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{`Lat: ${dest.lat}, Lng: ${dest.lng}`}</p>
                                </Card>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </CardContent>
        </Card>
    );
}
