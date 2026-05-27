"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DictionaryCard } from "./dictionary-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { SavedWord } from "@prisma/client";
import { ArrowUpDown } from "lucide-react";

type SortOrder = "date-desc" | "date-asc" | "alpha-asc" | "alpha-desc";

export function SavedWordsClient({ initialWords }: { initialWords: Pick<SavedWord, "id" | "word" | "createdAt">[] }) {
    const [words, setWords] = useState(initialWords);
    const [sortOrder, setSortOrder] = useState<SortOrder>("date-desc");
    const [expandedWordId, setExpandedWordId] = useState<string | null>(null);
    const router = useRouter();

    const handleDelete = async (id: string, wordStr: string) => {
        try {
            const res = await fetch("/api/words", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            if (res.ok) {
                setWords(w => w.filter(x => x.id !== id));
                toast.success(`Removed "${wordStr}" from saved words`);
                router.refresh();
            } else {
                toast.error("Failed to remove word");
            }
        } catch {
            toast.error("Failed to remove word");
        }
    };

    const sortedWords = useMemo(() => {
        return [...words].sort((a, b) => {
            if (sortOrder === "date-desc") {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            } else if (sortOrder === "date-asc") {
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            } else if (sortOrder === "alpha-asc") {
                return a.word.localeCompare(b.word);
            } else if (sortOrder === "alpha-desc") {
                return b.word.localeCompare(a.word);
            }
            return 0;
        });
    }, [words, sortOrder]);

    if (words.length === 0) {
        return (
            <div className="text-center py-20 bg-muted/10 rounded-xl border border-dashed mt-8">
                <h3 className="text-2xl font-bold mb-2">No Saved Words Yet</h3>
                <p className="text-muted-foreground">Words you save during reading practice will appear here.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card/30 p-4 rounded-b-xl border-t-0 border border-border/50 -mx-px">
                <p className="text-sm font-medium">
                    You have <span className="font-bold text-primary">{words.length}</span> saved total.
                </p>

                <div className="flex items-center gap-2">
                    <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                    <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as SortOrder)}>
                        <SelectTrigger className="w-45 bg-background">
                            <SelectValue placeholder="Sort by..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="date-desc">Newest First</SelectItem>
                            <SelectItem value="date-asc">Oldest First</SelectItem>
                            <SelectItem value="alpha-asc">A to Z</SelectItem>
                            <SelectItem value="alpha-desc">Z to A</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-3">
                {sortedWords.map((item) => (
                    <DictionaryCard
                        key={item.id}
                        word={item.word}
                        savedAt={item.createdAt}
                        expanded={expandedWordId === item.id}
                        onToggle={() => {
                            setExpandedWordId(expandedWordId === item.id ? null : item.id);
                        }}
                        onDeleteAction={() => handleDelete(item.id, item.word)}
                    />
                ))}
            </div>
        </div>
    );
}
