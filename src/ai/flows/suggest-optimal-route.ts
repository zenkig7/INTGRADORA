'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting optimal routes for the delivery robot, incorporating environmental factors.
 *
 * - suggestOptimalRoute - A function that takes a start and end location, and environmental factors, and suggests an optimized route.
 * - SuggestOptimalRouteInput - The input type for the suggestOptimalRoute function.
 * - SuggestOptimalRouteOutput - The return type for the suggestOptimalRoute function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestOptimalRouteInputSchema = z.object({
  startLatitude: z.number().describe('The starting latitude of the route.'),
  startLongitude: z.number().describe('The starting longitude of the route.'),
  endLatitude: z.number().describe('The destination latitude of the route.'),
  endLongitude: z.number().describe('The destination longitude of the route.'),
  environmentalFactors: z
    .string()
    .describe(
      'A comma separated list of environmental factors to consider when determining the optimal route, such as weather, traffic, road closures, and construction.'
    ),
});
export type SuggestOptimalRouteInput = z.infer<typeof SuggestOptimalRouteInputSchema>;

const SuggestOptimalRouteOutputSchema = z.object({
  routeDescription: z
    .string()
    .describe(
      'A detailed description of the suggested optimal route, taking into account the provided environmental factors. Include turn by turn directions.'
    ),
  estimatedTravelTime: z
    .string()
    .describe('The estimated travel time for the suggested route.'),
  estimatedDistance: z
    .string()
    .describe('The estimated distance for the suggested route.'),
});
export type SuggestOptimalRouteOutput = z.infer<typeof SuggestOptimalRouteOutputSchema>;

export async function suggestOptimalRoute(
  input: SuggestOptimalRouteInput
): Promise<SuggestOptimalRouteOutput> {
  return suggestOptimalRouteFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestOptimalRoutePrompt',
  input: {schema: SuggestOptimalRouteInputSchema},
  output: {schema: SuggestOptimalRouteOutputSchema},
  prompt: `You are an expert route planner for autonomous delivery robots.

You will generate an optimal route for the robot, considering the provided environmental factors.

Start Latitude: {{{startLatitude}}}
Start Longitude: {{{startLongitude}}}
End Latitude: {{{endLatitude}}}
End Longitude: {{{endLongitude}}}
Environmental Factors: {{{environmentalFactors}}}

Provide a detailed route description, estimated travel time, and estimated distance.

Format your response as a JSON object with the following keys:
- routeDescription: A detailed description of the suggested optimal route, taking into account the provided environmental factors. Include turn by turn directions.
- estimatedTravelTime: The estimated travel time for the suggested route.
- estimatedDistance: The estimated distance for the suggested route.`,
});

const suggestOptimalRouteFlow = ai.defineFlow(
  {
    name: 'suggestOptimalRouteFlow',
    inputSchema: SuggestOptimalRouteInputSchema,
    outputSchema: SuggestOptimalRouteOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
