
"use client";

import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '../ui/badge';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Fix for default icon path issue with Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});


const MapView = () => {
    const position: [number, number] = [19.4326, -99.1332];

    const Map = dynamic(
      () => import('../ui/map'), // adjust path to your Map component
      { ssr: false }
    )

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
