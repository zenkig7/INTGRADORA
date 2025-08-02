"use client";

import { Bot, LogOut, Settings, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '../ui/badge';

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-20 items-center justify-between gap-4 border-b bg-background/80 px-4 md:px-6">
      <div className="flex items-center gap-4">
        <Bot className="h-8 w-8 text-primary" />
        <div>
            <h1 className="text-2xl font-bold font-headline tracking-widest text-primary">ENTREGA DE ROBOTS</h1>
            <p className="text-xs text-muted-foreground">SISTEMA DE CONTROL</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Badge variant="outline" className="border-green-500 text-green-400 bg-green-500/10 text-sm">
            <ShieldCheck className="mr-2 h-4 w-4" />
            SEGURO
        </Badge>
        <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
            <Settings className="h-5 w-5" />
            <span>zenkig71@gmail.com</span>
        </div>
        <Link href="/">
            <Button variant="destructive" className="bg-red-600/20 text-red-400 border border-red-500 hover:bg-red-600/40">
                <LogOut className="mr-2 h-4 w-4" />
                SALIDA
            </Button>
        </Link>
      </div>
    </header>
  );
}
