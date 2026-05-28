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
import Header from "@/components/header";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { IconBrandGoogle } from "@tabler/icons-react";
import Image from "next/image";
import icon from "../../public/icon.png";

export default function LoginPage() {

    return (
        <>
            <Header />
            <div className="min-h-screen flex items-center justify-center bg-background px-6">
                <Card className="w-full max-w-md border border-border shadow-2xl z-10">
                    <div className="w-full flex items-center justify-center -mb-3">
                        <Image src={icon} alt="ELA Logo" width={36} height={36} />
                    </div>
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl font-bold tracking-tight">
                            Welcome to ELA
                        </CardTitle>

                        <CardDescription className="text-muted-foreground">
                            Practice reading, build vocabulary, and sharpen your grammar all in one place.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <Button
                            onClick={() => signIn("google", { callbackUrl: "/" })}
                            className="w-full font-medium"
                        >
                            <IconBrandGoogle />
                            Continue with Google
                        </Button>

                        <div className="text-xs text-center text-muted-foreground space-y-1">
                            <p>Your space to learn English, your way.</p>
                            <p>Free. Simple. Effective.</p>
                        </div>
                    </CardContent>
                </Card>
                <BackgroundBeams />
            </div>
        </>
    );
}

