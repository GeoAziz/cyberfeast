"use client";

import { useState, useTransition, useCallback, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Search, Loader, Utensils } from "lucide-react";
import { getSearchSuggestionsAction } from "@/app/actions";
import { cn } from "@/lib/utils";

export function SearchWithSuggestions() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = useCallback((searchQuery: string) => {
    if (searchQuery.length > 1) {
      startTransition(async () => {
        const result = await getSearchSuggestionsAction({ searchText: searchQuery });
        setSuggestions(result.suggestions);
        setShowSuggestions(true);
      });
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    fetchSuggestions(newQuery);
  };
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search restaurants, cuisines, or a specific dish..."
          className="pl-10 h-12 text-base"
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.length > 1 && setShowSuggestions(true)}
        />
        {isPending && <Loader className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-muted-foreground" />}
      </div>
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 mt-2 w-full rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95">
          <ul className="py-1">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
                onClick={() => {
                  setQuery(suggestion);
                  setShowSuggestions(false);
                }}
              >
                <Utensils className="h-4 w-4 text-muted-foreground" />
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
