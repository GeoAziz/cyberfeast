'use server';
/**
 * @fileOverview A conversational AI concierge for the CyberFeast app.
 *
 * - concierge - A function that handles user queries using tools.
 * - ConciergeInput - The input type for the concierge function.
 * - ConciergeOutput - The return type for the concierge function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getRestaurants, getMenuForRestaurant } from '@/services/restaurant-service';
import { getOrders } from '@/services/order-service';

export const ConciergeInputSchema = z.object({
  query: z.string().describe('The user\'s query.'),
  userId: z.string().optional().describe('The user\'s ID, if they are logged in.'),
});
export type ConciergeInput = z.infer<typeof ConciergeInputSchema>;

export const ConciergeOutputSchema = z.object({
  response: z.string().describe('The AI\'s response to the user.'),
});
export type ConciergeOutput = z.infer<typeof ConciergeOutputSchema>;

// Define Tools
const listRestaurantsTool = ai.defineTool(
  {
    name: 'listRestaurants',
    description: 'Get a list of available restaurants to order from.',
    inputSchema: z.object({}),
    outputSchema: z.array(z.object({ name: z.string(), cuisine: z.string(), rating: z.number() })),
  },
  async () => getRestaurants()
);

const getRestaurantMenuTool = ai.defineTool(
  {
    name: 'getRestaurantMenu',
    description: 'Get the menu for a specific restaurant to see what they offer.',
    inputSchema: z.object({ restaurantName: z.string().describe('The name of the restaurant.') }),
    outputSchema: z.array(z.object({ name: z.string(), price: z.string() })),
  },
  async ({ restaurantName }) => getMenuForRestaurant(restaurantName)
);

const getOrderHistoryTool = ai.defineTool(
  {
    name: 'getOrderHistory',
    description: 'Get the recent order history for the logged-in user to check on their order status.',
    inputSchema: z.object({ userId: z.string().describe("The user's unique ID.") }),
    outputSchema: z.array(z.object({ id: z.string(), status: z.string(), total: z.number(), createdAt: z.string() })),
  },
  async ({ userId }) => getOrders(userId)
);


export async function concierge(input: ConciergeInput): Promise<ConciergeOutput> {
  return conciergeFlow(input);
}


const conciergeFlow = ai.defineFlow(
  {
    name: 'conciergeFlow',
    inputSchema: ConciergeInputSchema,
    outputSchema: ConciergeOutputSchema,
  },
  async (input) => {
    const tools = [listRestaurantsTool, getRestaurantMenuTool];
    // Only provide the order history tool if the user is logged in
    if (input.userId) {
        tools.push(getOrderHistoryTool);
    }
    
    // The system prompt provides context and instructions to the model.
    const systemPrompt = `You are a helpful AI concierge for a futuristic food delivery app called CyberFeast.
Your goal is to answer user questions and help them find food or check on their orders.
Use the provided tools to answer questions based on real-time data.
Be concise and friendly. Format responses nicely using markdown where appropriate (e.g., lists, bolding).

If the user asks about their orders, you MUST use the getOrderHistory tool. 
The user's ID is: ${input.userId || 'Not Logged In'}. 
If the user is not logged in, you MUST inform them they need to log in to see their orders and cannot use the tool.`;

    const llmResponse = await ai.generate({
      prompt: input.query,
      model: 'googleai/gemini-2.0-flash',
      tools,
      system: systemPrompt
    });

    return { response: llmResponse.text };
  }
);
