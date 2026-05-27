"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
    useFloating,
    useDismiss,
    useRole,
    useInteractions,
    useTransitionStyles,
    useMergeRefs,
    autoUpdate,
    offset,
    flip,
    shift,
    inline,
    FloatingPortal,
} from "@floating-ui/react";
import { PlusIcon, SpeechIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { Separator } from "./ui/separator";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "./ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import { IWord, fetchWord, playSound } from "@/lib/dictionary";
import { incrementDailyActivity } from "@/lib/dailyActivity";



// ----- Main Component -----
export default function WordHighlighter({ text }: { text: string }) {
    const { data: session } = useSession();
    const cleanText = text.replace(/\*/g, "");
    const tokens = cleanText.match(
        /[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*|[^\w\s]+?\s*|\s+/g
    ) ?? [];

    const [selectedWord, setSelectedWord] = useState<string | null>(null);
    const [definition, setDefinition] = useState<IWord | null>(null);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [savedWords, setSavedWords] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetch("/api/words")
            .then(res => {
                if (!res.ok) return [];
                return res.json();
            })
            .then((data: { word: string }[]) => {
                if (Array.isArray(data)) {
                    setSavedWords(new Set(data.map(d => d.word.toLowerCase())));
                }
            })
            .catch(console.error);
    }, []);

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
                    setSavedWords(prev => new Set(prev).add(word.toLowerCase()));
                } else {
                    toast.error("Failed to save word.");
                }
                return;
            }

            toast.success(`Saved "${word}" to your saved words!`);
            setSavedWords(prev => new Set(prev).add(word.toLowerCase()));

            // Track daily word saving
            if (session?.user?.email) {
                incrementDailyActivity(session.user.email, 'word');
            }
        } catch (error) {
            console.error("Error saving word:", error);
            toast.error("Failed to save word.");
        }
    };

    const { x, y, strategy, refs, context } = useFloating({
        open,
        onOpenChange: setOpen,
        placement: "top",
        middleware: [offset(10), inline(), flip(), shift({ padding: 8 })],
        whileElementsMounted: autoUpdate,
    });

    const dismiss = useDismiss(context);
    const role = useRole(context);
    const { getReferenceProps, getFloatingProps } = useInteractions([dismiss, role]);

    const { isMounted, styles } = useTransitionStyles(context, {
        initial: { opacity: 0 },
        open: { opacity: 1 },
        close: { opacity: 0 },
        duration: 200,
    });

    // Merge the Floating UI callback ref with a local ref (if needed)
    const floatingRef = useMergeRefs([refs.setFloating]);

    const handleWordClick = async (word: string, event: React.MouseEvent) => {
        const cleanWord = word.replace(/[^\w\s-]/g, "");
        if (!/[A-Za-z]/.test(cleanWord)) return;

        if (open && selectedWord === word) {
            setOpen(false);
            return;
        }

        setSelectedWord(word);
        refs.setReference(event.currentTarget);
        setOpen(true);

        if (!definition || word !== selectedWord) {
            setDefinition(null);
            setLoading(true);
            const result = await fetchWord(cleanWord.toLowerCase());
            setDefinition(result);
            setLoading(false);
        }
    };

    const audio = definition?.phonetics?.find((p) => p.audio)?.audio;

    return (
        <>
            <div className="leading-relaxed">
                {tokens.map((token, index) => {
                    if (/^\s+$/.test(token)) {
                        return <span key={index}>{token}</span>;
                    }
                    return (
                        <span
                            key={index}
                            className={cn(
                                "cursor-pointer transition-colors",
                                open && selectedWord === token
                                    ? "text-primary underline font-semibold"
                                    : "hover:text-primary"
                            )}
                            onClick={(e) => handleWordClick(token, e)}
                            {...getReferenceProps()}
                        >
                            {token}
                        </span>
                    );
                })}
            </div>

            <FloatingPortal>
                {isMounted && (
                    <div
                        ref={floatingRef}
                        style={{
                            position: strategy,
                            top: y ?? 0,
                            left: x ?? 0,
                            ...styles,
                        }}
                        className="z-50"
                        {...getFloatingProps()}
                    >
                        <Card className="max-h-96 overflow-y-auto max-w-screen w-120 shadow-lg border">
                            {loading && (
                                <CardContent className="p-4 space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-4 w-full" />
                                </CardContent>
                            )}

                            {!loading && !definition && (
                                <CardContent className="p-4 text-sm text-muted-foreground">
                                    Definition not found.
                                </CardContent>
                            )}

                            {definition && (
                                <>
                                    <CardHeader>
                                        <CardTitle className="w-full text-lg font-bold flex justify-between overflow-y-auto">
                                            <div className="flex item-center gap-2">
                                                {definition.word}
                                                {audio && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon-sm"
                                                        onClick={() => playSound(audio)}
                                                    >
                                                        <SpeechIcon className="h-5 w-5" />
                                                    </Button>
                                                )}
                                            </div>
                                            <Button
                                                variant="outline"
                                                onClick={() => handleSaveWord(definition.word)}
                                                disabled={savedWords.has(definition.word.toLowerCase())}
                                            >
                                                {savedWords.has(definition.word.toLowerCase()) ? (
                                                    "Saved"
                                                ) : (
                                                    <><PlusIcon className="h-5 w-5" /> Save word</>
                                                )}
                                            </Button>
                                        </CardTitle>
                                        {definition.phonetic && (
                                            <div className="-mt-3 text-muted-foreground">
                                                {definition.phonetic}
                                            </div>
                                        )}
                                    </CardHeader>

                                    <CardContent className="space-y-4 pt-0">
                                        {definition.meanings.map((meaning, i) => (
                                            <div key={i} className="space-y-4">
                                                <div className="font-bold italic">{meaning.partOfSpeech}</div>

                                                {meaning.definitions.map((def, j) => (
                                                    <blockquote
                                                        key={j}
                                                        className="space-y-1 pl-3 border-l border-border"
                                                    >
                                                        <div>{def.definition}</div>

                                                        {def.example && (
                                                            <div className="pl-2 italic text-muted-foreground">
                                                                Example: {def.example}
                                                            </div>
                                                        )}

                                                        {def.synonyms?.length ? (
                                                            <div className="pl-2">
                                                                <span className="font-semibold">Synonyms:</span>{" "}
                                                                {def.synonyms.join(", ")}
                                                            </div>
                                                        ) : null}

                                                        {def.antonyms?.length ? (
                                                            <div className="pl-2">
                                                                <span className="font-semibold">Antonyms:</span>{" "}
                                                                {def.antonyms.join(", ")}
                                                            </div>
                                                        ) : null}
                                                    </blockquote>
                                                ))}

                                                {i !== definition.meanings.length - 1 && <Separator />}
                                            </div>
                                        ))}
                                    </CardContent>
                                </>
                            )}
                        </Card>
                    </div>
                )}
            </FloatingPortal>
        </>
    );
}
