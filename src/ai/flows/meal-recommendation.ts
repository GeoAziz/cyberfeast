'use server';

/**
 * @fileOverview Meal recommendation AI agent.
 *
 * - mealRecommendation - A function that handles the meal recommendation process.
 * - MealRecommendationInput - The input type for the mealRecommendation function.
 * - MealRecommendationOutput - The return type for the mealRecommendation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MealRecommendationInputSchema = z.object({
  preferences: z
    .string()
    .describe(
      'The user preferences for meal recommendations, e.g. dietary restrictions, cuisine preferences, budget, etc.'
    ),
});
export type MealRecommendationInput = z.infer<typeof MealRecommendationInputSchema>;

const MealRecommendationOutputSchema = z.object({
  mealName: z.string().describe('The recommended meal name.'),
  restaurantName: z.string().describe('The restaurant that serves the recommended meal.'),
  description: z.string().describe('A short description of the recommended meal.'),
});
export type MealRecommendationOutput = z.infer<typeof MealRecommendationOutputSchema>;

export async function mealRecommendation(input: MealRecommendationInput): Promise<MealRecommendationOutput> {
  return mealRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'mealRecommendationPrompt',
  input: {schema: MealRecommendationInputSchema},
  output: {schema: MealRecommendationOutputSchema},
  prompt: `You are an AI concierge specializing in meal recommendations. Based on the user's preferences, you will recommend a meal from a nearby restaurant.

User preferences: {{{preferences}}}

Output the meal name, restaurant name, and a short description of the recommended meal.`,
});

const mealRecommendationFlow = ai.defineFlow(
  {
    name: 'mealRecommendationFlow',
    inputSchema: MealRecommendationInputSchema,
    outputSchema: MealRecommendationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
