
"use server";

import { mealRecommendation, MealRecommendationInput, MealRecommendationOutput } from "@/ai/flows/meal-recommendation";
import { getSearchSuggestions, SearchSuggestionsInput, SearchSuggestionsOutput } from "@/ai/flows/ai-powered-search-suggestions";

export async function getMealRecommendationAction(
  input: MealRecommendationInput
): Promise<MealRecommendationOutput> {
  return await mealRecommendation(input);
}

export async function getSearchSuggestionsAction(
  input: SearchSuggestionsInput
): Promise<SearchSuggestionsOutput> {
  return await getSearchSuggestions(input);
}
