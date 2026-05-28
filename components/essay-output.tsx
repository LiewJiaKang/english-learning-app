"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import WordHighlighter from "./word-highlighter";
import { incrementDailyActivity } from "@/lib/dailyActivity";
import { IconCheck, IconCopy } from "@tabler/icons-react";

export default function EssayOutput({ result }: { result: string }) {
    const [copied, setCopied] = useState(false);
    const { data: session } = useSession();
    const lastIncrementedResultRef = useRef<string>('');

    useEffect(() => {
        if (result && result.length > 50 && result !== lastIncrementedResultRef.current) {
            // Update streak if there is a substantial result
            fetch("/api/streak", {
                method: "POST"
            }).catch(console.error);

            // Track daily reading practice
            if (session?.user?.email) {
                incrementDailyActivity(session.user.email, 'reading');
            }

            lastIncrementedResultRef.current = result;
        }
    }, [result, session?.user?.email]);

    if (!result) return (
        <span className="text-muted-foreground">
            {"Nothing to see yet. Pick a topic and level, and we'll create your reading practice."}
        </span>
    );

    const handleCopy = async () => {
        await navigator.clipboard.writeText(result);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative mx-2">

            {/* Copy Button */}
            <div className="absolute -top-8 -right-2">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopy}
                    className="h-8 w-8"
                >
                    {copied ? <IconCheck className="h-4 w-4" /> : <IconCopy className="h-4 w-4" />}
                </Button>
            </div>

            {/* Essay Content */}
            <article className="prose prose-neutral dark:prose-invert max-w-none leading-relaxed text-md whitespace-pre-wrap">
                <WordHighlighter text={result} />
            </article>

        </div>
    );
}

