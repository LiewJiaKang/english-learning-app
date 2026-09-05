"use client";

import { useEffect, useRef, useState } from "react";
import { Bookmark, Loader2, Search, Volume2, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import { incrementDailyActivity } from "@/lib/dailyActivity";
import { fetchWord, IWord, playSound } from "@/lib/dictionary";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "./ui/empty";

interface DatamuseSuggestion {
  word: string;
}

async function fetchSuggestions(term: string): Promise<string[]> {
  const res = await fetch(
    `https://api.datamuse.com/sug?s=${encodeURIComponent(term)}&max=8`
  );

  const data = (await res.json()) as DatamuseSuggestion[];

  return data.map((item) => item.word);
}

export default function DictionaryPage() {
  const [query, setQuery] = useState("");
  const [wordData, setWordData] = useState<IWord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searched, setSearched] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  const { data: session } = useSession();

  async function handleSaveWord(word: string) {
    if (!word) return;

    try {
      const res = await fetch("/api/words", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ word }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          toast.error("Please login to save words.");
        } else if (res.status === 409) {
          toast.error(`"${word}" is already saved!`);
        } else {
          toast.error("Failed to save word.");
        }

        return;
      }

      toast.success(`Saved "${word}" to your saved words!`);

      if (session?.user?.email) {
        incrementDailyActivity(session.user.email, "word");
      }
    } catch (error) {
      console.error("Error saving word:", error);
      toast.error("Failed to save word.");
    }
  }

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        const results = await fetchSuggestions(query.trim());

        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } catch {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 200);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  async function handleSearch(word?: string) {
    const searchTerm = (word ?? query).trim();

    if (!searchTerm) return;

    setShowSuggestions(false);
    setLoading(true);
    setError(null);
    setWordData(null);
    setSearched(true);

    try {
      const result = await fetchWord(searchTerm.toLowerCase());

      setWordData(result);
    } catch {
      setError(`No definition found for "${searchTerm}".`);
    } finally {
      setLoading(false);
    }
  }

  function handleSuggestionClick(word: string) {
    setQuery(word);
    handleSearch(word);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      handleSearch();
    }

    if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  }

  const audio = wordData?.phonetics?.find((phonetic) => phonetic.audio)?.audio;

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:py-10">
      <div className="space-y-6">
        {/* Search */}
        <div ref={containerRef} className="relative">
          <div className="flex gap-2">
            <div className="relative min-w-0 flex-1">
              <Input
                value={query}
                onChange={(e) => {
                  const value = e.target.value;
                  setQuery(value);

                  if (value.trim().length < 2) {
                    setSuggestions([]);
                    setShowSuggestions(false);
                  }
                }}
                onFocus={() => {
                  if (suggestions.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search for a word..."
                className="h-10"
              />

              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setSuggestions([]);
                    setShowSuggestions(false);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            <Button
              size="icon"
              className="size-10 shrink-0"
              onClick={() => handleSearch()}
              disabled={loading || !query.trim()}
              aria-label="Search"
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Search className="size-4" />
              )}
            </Button>
          </div>

          {/* Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 right-12 top-full z-50 mt-2 overflow-hidden rounded-lg border bg-popover shadow-md">
              {suggestions.map((word) => (
                <button
                  key={word}
                  type="button"
                  onClick={() =>
                    handleSuggestionClick(word)
                  }
                  className="block w-full px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted"
                >
                  {word}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && <DictionarySkeleton />}

        {/* Error */}
        {!loading && error && (
          <Card className="border-destructive/40 bg-destructive/5">
            <CardContent className="py-8 text-center">
              <p className="font-medium text-destructive">
                {error}
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Check the spelling and try searching again.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Definition */}
        {!loading && wordData && (
          <DefinitionCard
            wordData={wordData}
            audio={audio}
            onSave={handleSaveWord}
          />
        )}

        {/* Empty */}
        {!loading && !error && !wordData && !searched && (
          <Empty className="min-h-64 border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Search />
              </EmptyMedia>

              <EmptyTitle>Search for a word</EmptyTitle>

              <EmptyDescription className="max-w-sm">
                Enter an English word above to see its pronunciation,
                definitions, examples, synonyms, and antonyms.
              </EmptyDescription>
            </EmptyHeader>

            <EmptyContent>
              <p className="text-xs text-muted-foreground">
                Try something like{" "}
                <button
                  type="button"
                  onClick={() => {
                    setQuery("serendipity");
                    handleSearch("serendipity");
                  }}
                  className="font-medium underline underline-offset-4 hover:text-foreground"
                >
                  serendipity
                </button>
              </p>
            </EmptyContent>
          </Empty>
        )}
      </div>
    </main>
  );
}

function DefinitionCard({
  wordData,
  audio,
  onSave,
}: {
  wordData: IWord;
  audio?: string;
  onSave: (word: string) => void;
}) {
  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="break-words text-3xl font-semibold tracking-tight sm:text-4xl">
                {wordData.word}
              </h1>

              {audio && (
                <Button
                  variant="outline"
                  size="icon"
                  className="size-9 shrink-0 rounded-full"
                  onClick={() => playSound(audio)}
                  aria-label="Play pronunciation"
                >
                  <Volume2 className="size-4" />
                </Button>
              )}
            </div>

            {wordData.phonetic && (
              <p className="mt-1 text-sm text-muted-foreground">
                {wordData.phonetic}
              </p>
            )}
          </div>

          <Button
            variant="outline"
            className="w-full shrink-0 sm:w-auto"
            onClick={() => onSave(wordData.word)}
          >
            <Bookmark className="size-4" />
            Save word
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {wordData.meanings.map((meaning, index) => (
          <section key={index} className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold italic text-primary">
                {meaning.partOfSpeech}
              </span>

              <Separator className="flex-1" />
            </div>

            <div className="space-y-5">
              {meaning.definitions.map((definition, index) => (
                <Definition
                  key={index}
                  definition={definition}
                />
              ))}
            </div>
          </section>
        ))}
      </CardContent>
    </Card>
  );
}

function Definition({
  definition,
}: {
  definition: {
    definition: string;
    example?: string;
    synonyms?: string[];
    antonyms?: string[];
  };
}) {
  return (
    <div className="border-l-2 border-primary/30 pl-4">
      <p className="text-sm leading-6 sm:text-base">
        {definition.definition}
      </p>

      {definition.example && (
        <p className="mt-2 text-sm italic leading-6 text-muted-foreground">
          “{definition.example}”
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
        {definition.synonyms &&
          definition.synonyms.length > 0 && (
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">
                Synonyms:
              </span>{" "}
              {definition.synonyms.join(", ")}
            </p>
          )}

        {definition.antonyms &&
          definition.antonyms.length > 0 && (
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">
                Antonyms:
              </span>{" "}
              {definition.antonyms.join(", ")}
            </p>
          )}
      </div>
    </div>
  );
}

function DictionarySkeleton() {
  return (
    <Card>
      <CardContent className="space-y-6 py-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>

          <Skeleton className="h-9 w-28" />
        </div>

        <Skeleton className="h-px w-full" />

        <div className="space-y-4">
          <Skeleton className="h-4 w-20" />

          <div className="space-y-3 pl-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>

        <div className="space-y-4">
          <Skeleton className="h-4 w-24" />

          <div className="space-y-3 pl-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
