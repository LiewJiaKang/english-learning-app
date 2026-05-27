import {
    IconBook,
    IconBookmark,
    IconBulb,
    IconCards,
    IconCheck,
    IconClick,
    IconCopy,
    IconDeviceGamepad,
    IconSparkles,
    IconTools,
    IconBook2,
    IconExternalLink,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { getTipOfTheDay } from "@/lib/getDailyTip";
import tips from "@/data/tips.json";
import books from "@/data/books.json";
import Image from "next/image";
import Link from "next/link";
import { BookCover } from 'book-cover-3d'

interface DailyActivity {
    readingsGenerated: number;
    flashcardsCompleted: number;
    wordsSaved: number;
    lastUpdateDate: string;
}

function getTodayActivity(email: string): DailyActivity | null {
    const key = `daily_activity_${email}`;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const data: DailyActivity = JSON.parse(raw);
    const today = new Date().toISOString().slice(0, 10);
    return data.lastUpdateDate === today ? data : null;
}

function getTipIndex() {
    const today = new Date();
    const dateKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    let hash = 0;
    for (let i = 0; i < dateKey.length; i++) {
        hash = (hash * 31 + dateKey.charCodeAt(i)) % tips.length;
    }
    return hash + 1; // 1‑based
}

function getBookOfTheMonth() {
    const month = new Date().getMonth(); // 0–11
    return books.find((b) => b.month === month) ?? null;
}

export default function Dashboard() {
    const { data: session } = useSession();
    const [streak, setStreak] = useState(0);
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(`“${dailyTip}”`);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    useEffect(() => {
        const userEmail = session?.user?.email;
        if (!userEmail) return;

        const syncStreak = async () => {
            const cacheKey = `streak_${userEmail}`;
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
                setStreak(parseInt(cached, 10));
            }

            try {
                const res = await fetch("/api/streak");
                const data = await res.json();
                const s = data.currentStreak || 0;
                setStreak(s);
                localStorage.setItem(cacheKey, s.toString());
            } catch (error) {
                console.error(error);
            }
        };

        syncStreak();
    }, [session]);

    const userEmail = session?.user?.email;
    const todayActivity = userEmail ? getTodayActivity(userEmail) : null;
    const dailyTip = getTipOfTheDay(tips);
    const book = getBookOfTheMonth();

    return (
        <div className="container mx-auto max-w-6xl px-4 pt-20 md:pt-24 mb-10">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Dashboard</h1>

            {/* Welcome + Quick Actions */}
            <div className="mt-6 grid gap-4 md:grid-cols-2">
                <Card className="border-primary/20 bg-linear-to-br from-primary/10 to-background">
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold">Welcome back!</CardTitle>
                        <CardDescription>
                            You’re on a{" "}
                            <span className="font-semibold text-primary">{streak || 0}-day streak</span>.
                            Keep it up!
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                        <Button asChild size="sm">
                            <Link href="/essay">
                                <IconBook className="mr-2 h-4 w-4" />
                                Reading
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                            <Link href="/saved-words">
                                <IconBookmark className="mr-2 h-4 w-4" />
                                Saved words
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                            <IconClick className="h-5 w-5 text-muted-foreground" />
                            Quick Actions
                        </CardTitle>
                        <CardDescription>Jump into your tools</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-2">
                            <Button asChild variant="outline" size="sm" className="justify-start">
                                <Link href="/essay">
                                    <IconBook className="mr-2 h-4 w-4" />
                                    Reading
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="sm" className="justify-start">
                                <Link href="/flashcards">
                                    <IconCards className="mr-2 h-4 w-4" />
                                    Flashcards
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="sm" className="justify-start">
                                <Link href="/games">
                                    <IconDeviceGamepad className="mr-2 h-4 w-4" />
                                    Games
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="sm" className="justify-start">
                                <Link href="/tools">
                                    <IconTools className="mr-2 h-4 w-4" />
                                    Tools
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tip + Progress */}
            <div className="mt-4 grid gap-4 md:grid-cols-5">
                <div className="flex flex-col md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between text-lg font-medium">
                                <span className="flex items-center gap-2">
                                    <IconBulb className="h-5 w-5 text-muted-foreground" />
                                    Tip of the Day
                                </span>
                                <div className="flex items-center gap-1">
                                    <span className="text-xs text-muted-foreground">#{getTipIndex()}</span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={handleCopy}
                                    >
                                        {copied ? (
                                            <IconCheck className="h-4 w-4 text-emerald-500" />
                                        ) : (
                                            <IconCopy className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </Button>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div key={dailyTip} className="animate-in fade-in duration-300">
                                <p className="text-sm leading-relaxed text-muted-foreground italic border-l-2 border-muted-foreground/30 pl-3">
                                    “{dailyTip}”
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    {/* Book recommendation */}
                    {book && (
                        <div className="mt-4">
                            <Card className="border-muted-foreground/10">
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex items-center gap-2 text-lg font-medium">
                                        <IconBook2 className="h-5 w-5 text-muted-foreground" />
                                        Book recommendation
                                    </CardTitle>
                                    <CardDescription>
                                        {book.title} — {book.author}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        {book.cover && (
                                            <BookCover width={80} height={120} thickness={20} shadowColor="#333344">
                                                <Image
                                                    src={book.cover}
                                                    alt={book.title}
                                                    width={80}
                                                    height={120}
                                                />
                                            </BookCover>
                                        )}
                                        <div className="flex-1 space-y-4">
                                            <p className="text-sm text-muted-foreground">
                                                {book.blurb}
                                            </p>
                                            {book.link && (
                                                <a href={book.link} target="_blank" rel="noopener noreferrer">
                                                    <Button size="sm" variant="outline">
                                                        <IconExternalLink className="mr-2 h-4 w-4" />
                                                        Free read
                                                    </Button>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>

                <Card className="md:col-span-3">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-lg font-medium">
                            <IconSparkles className="h-5 w-5 text-muted-foreground" />
                            Today’s Progress
                        </CardTitle>
                        <CardDescription>Your activity so far</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {todayActivity ? (
                            <div className="grid grid-cols-3 gap-3">
                                <div className="flex flex-col items-center p-3 rounded-lg bg-muted/30">
                                    <IconBook className="h-5 w-5 text-muted-foreground" />
                                    <span className="mt-1 text-xl font-semibold">
                                        {Math.round(todayActivity.readingsGenerated / 2)}
                                    </span>
                                    <span className="text-xs text-muted-foreground">Readings</span>
                                </div>
                                <div className="flex flex-col items-center p-3 rounded-lg bg-muted/30">
                                    <IconCards className="h-5 w-5 text-muted-foreground" />
                                    <span className="mt-1 text-xl font-semibold">
                                        {todayActivity.flashcardsCompleted}
                                    </span>
                                    <span className="text-xs text-muted-foreground">Flashcards</span>
                                </div>
                                <div className="flex flex-col items-center p-3 rounded-lg bg-muted/30">
                                    <IconBookmark className="h-5 w-5 text-muted-foreground" />
                                    <span className="mt-1 text-xl font-semibold">
                                        {todayActivity.wordsSaved}
                                    </span>
                                    <span className="text-xs text-muted-foreground">Words saved</span>
                                </div>
                            </div>
                        ) : (
                            <p className="py-6 text-center text-sm text-muted-foreground italic">
                                No activity yet today — start learning!
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
