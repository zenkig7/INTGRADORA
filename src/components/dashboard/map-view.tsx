"use client";

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '../ui/badge';
import 'leaflet/dist/leaflet.css';

const MapView = () => {
    const Map = useMemo(() => dynamic(
        () => import('@/components/ui/map'),
        { 
            ssr: false,
            loading: () => <div className="w-full h-full bg-muted animate-pulse" />
        }
    ), []);

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
                   <Map/>
                </div>
            </div>
        </Card>
    );
}

export { MapView };
