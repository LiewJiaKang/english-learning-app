"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Volume2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { IWord, fetchWord, playSound } from "@/lib/dictionary";
import { IconBookmark } from "@tabler/icons-react";
import { toast } from "sonner";
import { incrementDailyActivity } from "@/lib/dailyActivity";
import { useSession } from "next-auth/react";

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
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const { data: session } = useSession();

    const handleSaveWord = async (word: string) => {
        if (!word) return;
        try {
            const res = await fetch("/api/words", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
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

            // Track daily word saving
            if (session?.user?.email) {
                incrementDailyActivity(session.user.email, 'word');
            }
        } catch (error) {
            console.error("Error saving word:", error);
            toast.error("Failed to save word.");
        }
    };



    // Fetch live suggestions with debounce
    useEffect(() => {
        if (query.length < 2) return;

        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            try {
                const results = await fetchSuggestions(query);
                setSuggestions(results);
                setShowSuggestions(results.length > 0);
            } catch {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 200);

        return () => clearTimeout(debounceRef.current);
    }, [query]);

    // Close suggestions when clicking outside the search container
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const closeDropdown = () => setShowSuggestions(false);

    const handleSearch = async (word?: string) => {
        const searchTerm = (word || query).trim();
        if (!searchTerm) return;

        closeDropdown();        // <--- always close
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
    };

    const handleSuggestionClick = (suggestion: string) => {
        setQuery(suggestion);
        closeDropdown();
        handleSearch(suggestion);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            closeDropdown();      // <--- kill dropdown immediately
            handleSearch();
        }
    };

    const audio = wordData?.phonetics?.find((p) => p.audio)?.audio;

    return (
        <div className="lg:px-32 pt-6">
            <div ref={containerRef} className="relative mb-8">
                <div className="flex gap-2">
                    <Input
                        ref={inputRef}
                        placeholder="Type a word…"
                        value={query}
                        onChange={(e) => {
                            const value = e.target.value;
                            setQuery(value);
                            if (value.length < 2) {
                                setSuggestions([]);
                                setShowSuggestions(false);
                            }
                        }}
                        onFocus={() => {
                            if (suggestions.length > 0) setShowSuggestions(true);
                        }}
                        onKeyDown={handleKeyDown}
                        className="h-9 text-lg"
                    />
                    <Button size="icon-lg" onClick={() => handleSearch()} disabled={loading}>
                        {loading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <Search className="h-5 w-5" />
                        )}
                    </Button>
                </div>

                {/* Dropdown – always matches input width */}
                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 mr-11 z-50 bg-popover border border-border rounded-md shadow-lg overflow-hidden">
                        {suggestions.map((word) => (
                            <button
                                key={word}
                                onClick={() => handleSuggestionClick(word)}
                                className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors first:rounded-t-md last:rounded-b-md"
                            >
                                {word}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Loading */}
            {loading && (
                <Card>
                    <CardContent className="py-6 space-y-3">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                </Card>
            )}

            {/* Error */}
            {error && !loading && (
                <Card className="border-destructive/50 bg-destructive/5">
                    <CardContent className="py-6">
                        <p className="text-destructive font-medium">{error}</p>
                    </CardContent>
                </Card>
            )}

            {/* Definition */}
            {wordData && !loading && (
                <Card>
                    <CardContent className="space-y-4">
                        <div className="flex w-full justify-between gap-2">
                            <div>
                                <span className="font-bold text-3xl">{wordData.word}</span>
                                {audio && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => playSound(audio)}
                                    >
                                        <Volume2 className="h-5 w-5" />
                                    </Button>
                                )}
                            </div>
                            <Button onClick={() => { handleSaveWord(wordData.word) }}><IconBookmark />Save word</Button>
                        </div>
                        {wordData.phonetic && (
                            <p className="text-sm text-muted-foreground">{wordData.phonetic}</p>
                        )}

                        {wordData.meanings.map((meaning, i) => (
                            <div key={i} className="space-y-3">
                                <div className="font-bold italic text-primary">
                                    {meaning.partOfSpeech}
                                </div>
                                {meaning.definitions.map((def, j) => (
                                    <blockquote
                                        key={j}
                                        className="space-y-1 pl-3 border-l-2 border-primary/40 text-sm"
                                    >
                                        <div>{def.definition}</div>
                                        {def.example && (
                                            <div className="pl-2 italic text-muted-foreground">
                                                “{def.example}”
                                            </div>
                                        )}
                                        {def.synonyms && def.synonyms.length > 0 && (
                                            <div className="pl-2">
                                                <span className="font-semibold text-xs">Synonyms: </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {def.synonyms.join(", ")}
                                                </span>
                                            </div>
                                        )}
                                        {def.antonyms && def.antonyms.length > 0 && (
                                            <div className="pl-2">
                                                <span className="font-semibold text-xs">Antonyms: </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {def.antonyms.join(", ")}
                                                </span>
                                            </div>
                                        )}
                                    </blockquote>
                                ))}
                                {i !== wordData.meanings.length - 1 && (
                                    <Separator className="my-2" />
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Empty state */}
            {!loading && !error && !wordData && !searched && (
                <Card className="border-dashed bg-muted/20">
                    <CardContent className="py-12 text-center text-muted-foreground">
                        <p>Look up a word to see its definition.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
