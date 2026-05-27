"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { Separator } from "./ui/separator";
import { Progress } from "./ui/progress";
import { SpeechIcon } from "lucide-react";
import { IWord, fetchWord, playSound } from "@/lib/dictionary";
import { Flashcard } from "@prisma/client";
import { toast } from "sonner";
import { incrementDailyActivity } from "@/lib/dailyActivity";

export function FlashcardClient({ initialCards }: { initialCards: Flashcard[] }) {
    const { data: session } = useSession();
    const [queue, setQueue] = useState<Flashcard[]>(initialCards);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);

    const [definition, setDefinition] = useState<IWord | null>(null);
    const [loadingDef, setLoadingDef] = useState(false);

    const currentCard = queue[currentIndex];

    useEffect(() => {
        if (!showAnswer || !currentCard || definition || loadingDef) return;

        const loadDefinition = async () => {
            setLoadingDef(true);
            const res = await fetchWord(currentCard.word.toLowerCase());
            setDefinition(res);
            setLoadingDef(false);
        };

        loadDefinition();
    }, [showAnswer, currentCard, definition, loadingDef]);

    // Reset definition state when moving to a new card
    useEffect(() => {
        if (!currentCard) return;

        const resetCardState = () => {
            setShowAnswer(false);
            setDefinition(null);
            setLoadingDef(false);
        };

        resetCardState();
    }, [currentCard]);

    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!currentCard) {
        return (
            <div className="text-center py-20 bg-muted/10 rounded-xl border border-dashed mt-8">
                <h3 className="text-2xl font-bold mb-2">{"You're all caught up!"}</h3>
                <p className="text-muted-foreground">No more flashcards due for review today.</p>
            </div>
        );
    }

    const handleRate = async (quality: number) => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/flashcards", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: currentCard.id, quality }),
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Failed to rate");
            }

            // Track daily flashcard completion
            if (session?.user?.email) {
                incrementDailyActivity(session.user.email, 'flashcard');
            }

            // Move to next card
            setCurrentIndex(prev => prev + 1);
        } catch (error) {
            console.error(error);
            toast.error("Failed to save your review.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const audio = definition?.phonetics?.find((p) => p.audio)?.audio;

    return (
        <div className="max-w-2xl mx-auto space-y-6 mt-8">
            <div className="space-y-2">
                <div className="flex justify-between items-center text-sm font-medium text-muted-foreground">
                    <span>Card {currentIndex + 1} of {queue.length}</span>
                    <span>{queue.length - currentIndex} remaining</span>
                </div>
                <Progress value={(currentIndex / queue.length) * 100} />
            </div>

            <Card className="min-h-75 flex flex-col justify-center relative overflow-hidden shadow-xl border-none ring-1 ring-border">
                {!showAnswer && (
                    <div className="absolute inset-0 z-0 opacity-10 dark:opacity-[0.35] pointer-events-none">
                        <div className="absolute inset-0 bg-[radial-gradient(#808080_1px,transparent_1px)] bg-size-20px_20px mask-[radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
                    </div>
                )}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>

                <CardContent className="p-8 flex flex-col items-center relative z-10">
                    {!showAnswer ? (
                        <div className="text-center space-y-8">
                            <h2 className="text-5xl font-bold tracking-tight w-full overflow-y-hidden overflow-x-auto">{currentCard.word}</h2>
                            <Button size="lg" onClick={() => setShowAnswer(true)} className="mt-8">
                                Show Answer
                            </Button>
                        </div>
                    ) : (
                        <div className="w-full animate-in fade-in zoom-in-95 duration-200 overflow-x-auto">
                            <div className="text-center mb-6">
                                <h2 className="text-4xl font-bold tracking-tight flex items-center justify-center gap-3">
                                    {currentCard.word}
                                    {audio && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-10 w-10 text-primary"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                playSound(audio);
                                            }}
                                        >
                                            <SpeechIcon className="h-6 w-6" />
                                        </Button>
                                    )}
                                </h2>
                                {definition?.phonetic && (
                                    <div className="text-lg text-muted-foreground mt-2">
                                        {definition.phonetic}
                                    </div>
                                )}
                            </div>

                            <Separator className="my-6" />

                            <div className="space-y-4 max-h-[25vh] overflow-y-auto px-2 text-left">
                                {loadingDef && (
                                    <div className="space-y-3">
                                        <Skeleton className="h-5 w-full" />
                                        <Skeleton className="h-5 w-3/4" />
                                        <Skeleton className="h-5 w-5/6" />
                                    </div>
                                )}

                                {!loadingDef && !definition && (
                                    <div className="text-center text-muted-foreground py-4">
                                        Definition not found in dictionary.
                                    </div>
                                )}

                                {!loadingDef && definition && definition.meanings.map((meaning, i) => (
                                    <div key={i} className="space-y-3">
                                        <div className="font-bold italic text-primary">{meaning.partOfSpeech}</div>
                                        {meaning.definitions.map((def, j) => (
                                            <blockquote
                                                key={j}
                                                className="space-y-1 pl-4 border-l-2 border-primary/40 text-sm md:text-base"
                                            >
                                                <div>{def.definition}</div>
                                                {def.example && (
                                                    <div className="italic text-muted-foreground mt-1">
                                                        {'"' + def.example + '"'}
                                                    </div>
                                                )}
                                            </blockquote>
                                        ))}
                                        {i !== definition.meanings.length - 1 && <Separator className="my-3" />}
                                    </div>
                                ))}
                            </div>

                            <div className="mt-10 pt-6 border-t">
                                <p className="text-center text-sm text-muted-foreground mb-4 font-medium uppercase tracking-wider">
                                    How well did you know this?
                                </p>
                                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                    <Button variant="outline" className="flex-col h-auto py-3 gap-1 hover:bg-destructive/10 hover:text-destructive hover:border-destructive" disabled={isSubmitting} onClick={() => handleRate(0)}>
                                        <span className="text-lg font-bold">0</span>
                                        <span className="text-[10px] opacity-70">Blackout</span>
                                    </Button>
                                    <Button variant="outline" className="flex-col h-auto py-3 gap-1 hover:bg-orange-500/10 hover:text-orange-500 hover:border-orange-500" disabled={isSubmitting} onClick={() => handleRate(1)}>
                                        <span className="text-lg font-bold">1</span>
                                        <span className="text-[10px] opacity-70">Wrong</span>
                                    </Button>
                                    <Button variant="outline" className="flex-col h-auto py-3 gap-1 hover:bg-yellow-500/10 hover:text-yellow-600 hover:border-yellow-500" disabled={isSubmitting} onClick={() => handleRate(2)}>
                                        <span className="text-lg font-bold">2</span>
                                        <span className="text-[10px] opacity-70">Hard</span>
                                    </Button>
                                    <Button variant="outline" className="flex-col h-auto py-3 gap-1 hover:bg-blue-500/10 hover:text-blue-600 hover:border-blue-500" disabled={isSubmitting} onClick={() => handleRate(3)}>
                                        <span className="text-lg font-bold">3</span>
                                        <span className="text-[10px] opacity-70">Okay</span>
                                    </Button>
                                    <Button variant="outline" className="flex-col h-auto py-3 gap-1 hover:bg-green-500/10 hover:text-green-600 hover:border-green-500" disabled={isSubmitting} onClick={() => handleRate(4)}>
                                        <span className="text-lg font-bold">4</span>
                                        <span className="text-[10px] opacity-70">Good</span>
                                    </Button>
                                    <Button variant="outline" className="flex-col h-auto py-3 gap-1 hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500" disabled={isSubmitting} onClick={() => handleRate(5)}>
                                        <span className="text-lg font-bold">5</span>
                                        <span className="text-[10px] opacity-70">Perfect</span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
