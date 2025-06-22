// src/ai/flows/ai-powered-search-suggestions.ts
'use server';
/**
 * @fileOverview AI-powered search suggestions for restaurants and food.
 *
 * - getSearchSuggestions - A function that provides AI-powered search suggestions.
 * - SearchSuggestionsInput - The input type for the getSearchSuggestions function.
 * - SearchSuggestionsOutput - The return type for the getSearchSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SearchSuggestionsInputSchema = z.object({
  searchText: z
    .string()
    .describe('The text that the user has entered in the search bar.'),
});
export type SearchSuggestionsInput = z.infer<typeof SearchSuggestionsInputSchema>;

const SearchSuggestionsOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('An array of suggested search terms.'),
});
export type SearchSuggestionsOutput = z.infer<typeof SearchSuggestionsOutputSchema>;

export async function getSearchSuggestions(input: SearchSuggestionsInput): Promise<SearchSuggestionsOutput> {
  return searchSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'searchSuggestionsPrompt',
  input: {schema: SearchSuggestionsInputSchema},
  output: {schema: SearchSuggestionsOutputSchema},
  prompt: `You are an AI assistant designed to provide search suggestions for a food delivery app called CyberFeast.

  The user has entered the following text in the search bar: {{{searchText}}}

  Suggest search terms related to restaurants, cuisines, and specific food items that the user might be looking for.

  Return a JSON array of strings.  Do not include any explanation.

  Example:
  ["Pizza", "Burgers", "Italian Food", "Vegan Options"]
  `,
});

const searchSuggestionsFlow = ai.defineFlow(
  {
    name: 'searchSuggestionsFlow',
    inputSchema: SearchSuggestionsInputSchema,
    outputSchema: SearchSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
