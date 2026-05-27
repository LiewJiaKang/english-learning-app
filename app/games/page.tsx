"use client";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useSession } from "next-auth/react";
import { IconDeviceGamepad, IconSparkles, IconPlayerPlay } from "@tabler/icons-react";

export default function Page() {
    const { data: session } = useSession();
    const username = session?.user?.name || "English learner";

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />

            <main className="flex-1 container max-w-5xl mx-auto px-4 py-12 space-y-10">
                {/* Hero section */}
                <div className="text-center space-y-3">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-sm font-medium text-primary">
                        <IconDeviceGamepad className="h-4 w-4" />
                        Interactive Learning
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                        Learning <span className="text-primary">Games</span>
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Practice vocabulary, grammar, and spelling — without feeling like a
                        textbook.
                    </p>
                </div>

                {/* Game embed — fancy wrapper */}
                <Card className="relative overflow-hidden border-2 border-primary/10 shadow-2xl shadow-primary/5 transition-shadow hover:shadow-primary/10">
                    {/* subtle gradient bar at top */}
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40" />

                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                            <CardTitle className="text-xl font-semibold flex items-center gap-2">
                                <IconPlayerPlay className="h-5 w-5 text-primary" />
                                Featured Game
                            </CardTitle>
                            <CardDescription>
                                A quick challenge to test your skills
                            </CardDescription>
                        </div>
                        <Badge variant="secondary" className="gap-1.5">
                            <IconSparkles className="h-3.5 w-3.5" />
                            New
                        </Badge>
                    </CardHeader>

                    <CardContent className="p-0">
                        <div className="relative bg-black/5 dark:bg-white/5">
                            <iframe
                                src={`https://turbowarp.org/1295917322/embed?username=${username}`}
                                width="100%"
                                height="600"
                                style={{ border: "0", overflow: "hidden", colorScheme: "auto" }}
                                allowFullScreen
                                className="w-full min-h-112.5 md:min-h-150"
                                title="Learning game"
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="grid sm:grid-cols-3 gap-4 text-center">
                    <Card className="bg-muted/20 border-dashed">
                        <CardContent>
                            <p className="text-3xl font-bold text-primary">1</p>
                            <p className="text-sm text-muted-foreground">Game available</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-muted/20 border-dashed">
                        <CardContent>
                            <p className="text-3xl font-bold text-primary">∞</p>
                            <p className="text-sm text-muted-foreground">Replay value</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-muted/20 border-dashed">
                        <CardContent>
                            <p className="text-3xl font-bold text-primary">100%</p>
                            <p className="text-sm text-muted-foreground">Free to play</p>
                        </CardContent>
                    </Card>
                </div>
            </main>

            <Footer />
        </div>
    );
}
