"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { suggestOptimalRoute, SuggestOptimalRouteOutput } from '@/ai/flows/suggest-optimal-route';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Route, Sparkles, BotMessageSquare, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Separator } from '../ui/separator';

const formSchema = z.object({
  startLatitude: z.coerce.number().min(-90, "Must be >= -90").max(90, "Must be <= 90"),
  startLongitude: z.coerce.number().min(-180, "Must be >= -180").max(180, "Must be <= 180"),
  endLatitude: z.coerce.number().min(-90, "Must be >= -90").max(90, "Must be <= 90"),
  endLongitude: z.coerce.number().min(-180, "Must be >= -180").max(180, "Must be <= 180"),
  environmentalFactors: z.string().min(3, { message: 'Please describe environmental factors.' }),
});

export function RouteOptimizer() {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<SuggestOptimalRouteOutput | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            startLatitude: 34.0522,
            startLongitude: -118.2437,
            endLatitude: 34.0567,
            endLongitude: -118.2512,
            environmentalFactors: "Heavy afternoon traffic, one road closure on 5th street.",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        setResult(null);
        try {
            const output = await suggestOptimalRoute(values);
            setResult(output);
            setIsDialogOpen(true);
        } catch (error) {
            console.error("Error optimizing route:", error);
            toast({
                title: "Optimization Failed",
                description: "Could not get a route suggestion. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline">
                        <Route className="h-6 w-6" />
                        AI Route Optimizer
                    </CardTitle>
                    <CardDescription>
                        Get an AI-powered optimal route suggestion based on environmental factors.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                               <FormField control={form.control} name="startLatitude" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Start Latitude</FormLabel>
                                        <FormControl><Input type="number" step="any" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                               <FormField control={form.control} name="startLongitude" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Start Longitude</FormLabel>
                                        <FormControl><Input type="number" step="any" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                               <FormField control={form.control} name="endLatitude" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>End Latitude</FormLabel>
                                        <FormControl><Input type="number" step="any" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                               <FormField control={form.control} name="endLongitude" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>End Longitude</FormLabel>
                                        <FormControl><Input type="number" step="any" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                            </div>
                             <FormField control={form.control} name="environmentalFactors" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Environmental Factors</FormLabel>
                                    <FormControl><Input placeholder="e.g., Rain, traffic, road closures" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Optimizing...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="mr-2 h-4 w-4" />
                                        Suggest Optimal Route
                                    </>
                                )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {result && (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 font-headline text-2xl">
                               <BotMessageSquare className="h-7 w-7 text-primary" />
                               Optimal Route Suggestion
                            </DialogTitle>
                            <DialogDescription>
                                Here is the AI-suggested route based on the factors you provided.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-lg border p-4">
                                <p><strong>Est. Distance:</strong> {result.estimatedDistance}</p>
                                <p><strong>Est. Time:</strong> {result.estimatedTravelTime}</p>
                            </div>
                            <p className="font-semibold mt-2">Route Details:</p>
                            <ScrollArea className="h-64 w-full rounded-md border p-4 bg-background/50">
                                <pre className="whitespace-pre-wrap font-body text-sm">{result.routeDescription}</pre>
                            </ScrollArea>
                        </div>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">Close</Button>
                        </DialogClose>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}
