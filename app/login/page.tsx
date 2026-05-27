"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Flame } from "lucide-react";
import Header from "@/components/header";
import { BackgroundBeams } from "@/components/ui/background-beams";

export default function LoginPage() {

    return (
        <>
            <Header />
            <div className="min-h-screen flex items-center justify-center bg-background px-6">
                <Card className="w-full max-w-md border border-border shadow-2xl z-10">
                    <CardHeader className="text-center space-y-4">
                        <div className="flex justify-center">
                            <div className="p-4 rounded-2xl bg-primary/10 shadow-inner">
                                <Flame className="h-7 w-7 text-primary" />
                            </div>
                        </div>

                        <CardTitle className="text-3xl font-bold tracking-tight">
                            Enter ELA
                        </CardTitle>

                        <CardDescription className="text-muted-foreground">
                            English Learning App
                        </CardDescription>

                        <p className="text-sm text-muted-foreground">
                            Sign in to your account
                        </p>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <Button
                            onClick={() => signIn("google", { callbackUrl: "/" })}
                            className="w-full font-medium"
                        >
                            Continue with Google
                        </Button>

                        <div className="text-xs text-center text-muted-foreground space-y-1">
                            <p>Step into the flames of fluency.</p>
                            <p>No eternal suffering. Just better grammar.</p>
                        </div>
                    </CardContent>
                </Card>
                <BackgroundBeams />
            </div>
        </>
    );
}

