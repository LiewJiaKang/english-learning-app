"use client";

import { useState, useEffect } from "react";
import { SpeechIcon, ChevronDownIcon, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { Separator } from "./ui/separator";
import { Card } from "./ui/card";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "./ui/collapsible";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "./ui/alert-dialog";
import { IWord, fetchWord, playSound } from "@/lib/dictionary";

interface DictionaryCardProps {
    word: string;
    savedAt: Date;
    expanded: boolean;
    onToggle: () => void;
    onDeleteAction: () => void;
}

export function DictionaryCard({ word, savedAt, expanded, onToggle, onDeleteAction }: DictionaryCardProps) {
    const [definition, setDefinition] = useState<IWord | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!expanded || definition || loading) return;

        const loadDefinition = async () => {
            setLoading(true);
            const res = await fetchWord(word.toLowerCase());
            setDefinition(res);
            setLoading(false);
        };

        loadDefinition();
    }, [expanded, word, definition, loading]);

    const audio = definition?.phonetics?.find((p) => p.audio)?.audio;

    return (
        <Card className="w-full relative group">

            <Collapsible open={expanded} onOpenChange={() => onToggle()} className="w-full">
                <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="group w-[calc(100%-3rem)] mx-6">
                        <span className="space-x-2">
                            <span className="text-lg font-semibold">{word}</span>
                            <span className="text-xs text-muted-foreground">
                                Saved on {new Date(savedAt).toLocaleDateString()}
                            </span>
                        </span>
                        <ChevronDownIcon className="ml-auto group-data-[state=open]:rotate-180" />
                    </Button>
                </CollapsibleTrigger>

                <CollapsibleContent>
                    <Separator className="mt-6" />
                    <div className="px-10 pt-2">
                        {loading && (
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-4 w-full" />
                            </div>
                        )}

                        {!loading && !definition && (
                            <div className="text-sm text-muted-foreground">
                                Definition not found.
                            </div>
                        )}

                        {!loading && definition && (
                            <div className="space-y-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-lg">{definition.word}</span>
                                        {audio && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    playSound(audio);
                                                }}
                                            >
                                                <SpeechIcon className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="ml-auto text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Remove saved word?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Are you sure you want to remove {'"'}{word}{'"'} from your saved words? This action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => onDeleteAction()} variant="destructive">Remove</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                    {definition.phonetic && (
                                        <div className="text-sm text-muted-foreground">
                                            {definition.phonetic}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    {definition.meanings.map((meaning, i) => (
                                        <div key={i} className="space-y-3">
                                            <div className="font-bold italic text-primary">{meaning.partOfSpeech}</div>

                                            {meaning.definitions.map((def, j) => (
                                                <blockquote
                                                    key={j}
                                                    className="space-y-1 pl-3 border-l-2 border-primary/40 text-sm"
                                                >
                                                    <div>{def.definition}</div>

                                                    {def.example && (
                                                        <div className="pl-2 italic text-muted-foreground">
                                                            {`"${def.example}"`}
                                                        </div>
                                                    )}

                                                    {def.synonyms && def.synonyms.length > 0 && (
                                                        <div className="pl-2">
                                                            <span className="font-semibold text-xs">Synonyms: </span>
                                                            <span className="text-xs text-muted-foreground">{def.synonyms.join(", ")}</span>
                                                        </div>
                                                    )}

                                                    {def.antonyms && def.antonyms.length > 0 && (
                                                        <div className="pl-2">
                                                            <span className="font-semibold text-xs">Antonyms: </span>
                                                            <span className="text-xs text-muted-foreground">{def.antonyms.join(", ")}</span>
                                                        </div>
                                                    )}
                                                </blockquote>
                                            ))}

                                            {i !== definition.meanings.length - 1 && <Separator className="my-2" />}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
}
