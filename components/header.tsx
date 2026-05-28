"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import { IconBookmark, IconCards, IconDeviceGamepad, IconHome, IconTools, IconBook, IconFlame } from "@tabler/icons-react";
const ModeToggle = dynamic(() => import("@/components/ui/theme-switch"), {
    ssr: false,
});
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Toaster } from "./ui/sonner";
import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import { ButtonGroup } from "./ui/button-group";
import Image from "next/image";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { FloatingDock } from "./ui/floating-dock";

export default function Navbar() {
    const { data: session } = useSession();
    const [streak, setStreak] = useState(0);

    useEffect(() => {
        const userEmail = session?.user?.email;
        if (!userEmail) return;

        const syncStreak = async () => {
            const cacheKey = `streak_${userEmail}`;
            const cachedStreak = localStorage.getItem(cacheKey);
            if (cachedStreak) {
                setStreak(parseInt(cachedStreak, 10));
            }

            try {
                const res = await fetch("/api/streak");
                const data = await res.json();
                const newStreak = data.currentStreak || 0;
                setStreak(newStreak);
                localStorage.setItem(cacheKey, newStreak.toString());
            } catch (error) {
                console.error(error);
            }
        };

        syncStreak();
    }, [session]);

    const floatingItems = [
        { title: "Home", href: "/", icon: <IconHome className="w-full h-full" /> },
        { title: "Games", href: "/games", icon: <IconDeviceGamepad className="w-full h-full" /> },
        { title: "Reading Practice", href: "/essay", icon: <IconBook className="w-full h-full" /> },
        { title: "Flashcards", href: "/flashcards", icon: <IconCards className="w-full h-full" /> },
        { title: "Tools", href: "/tools", icon: <IconTools className="w-full h-full" /> },
        { title: "Saved Words", href: "/saved-words", icon: <IconBookmark className="w-full h-full" /> },
    ]

    return (
        <>
            <header className="w-full fixed top-0 left-0 z-50">
                <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-1 mt-2">

                    {/* Left: Logo */}
                    <div className="flex items-center space-x-4">
                        <Link href="/" className="text-lg font-bold tracking-wider">
                            ELA
                        </Link>
                    </div>

                    <ButtonGroup>
                        <ModeToggle />

                        {session ? (
                            <>
                                <Tooltip>
                                    <TooltipTrigger asChild>

                                        <Button variant="outline" className="backdrop-blur-2xl text-orange-500 font-semibold" title="Current Streak">
                                            <IconFlame size={20} className={streak > 0 ? "fill-orange-500" : ""} />
                                            <span>{streak}</span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Current Streak</p>
                                        <p className="font-semibold">{streak} days</p>
                                    </TooltipContent>
                                </Tooltip>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="backdrop-blur-2xl">
                                            {session.user?.image && (
                                                <Image
                                                    src={session.user.image}
                                                    alt={session.user?.name || "Profile Image"}
                                                    width={24}
                                                    height={24}
                                                    className="rounded-full"
                                                />
                                            )}
                                            <p className="sm:block hidden">{session.user?.name || "Profile"}</p>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem onClick={() => signOut()}>
                                            Logout
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        ) : (
                            <Button
                                className="backdrop-blur-2xl"
                                variant="outline"
                                asChild
                            >
                                <Link href="/login">
                                    Login
                                </Link>
                            </Button>
                        )}
                    </ButtonGroup>
                </div>
            </header >
            <div className="fixed bottom-4 right-0 z-50 w-full flex items-center justify-center">
                <FloatingDock items={floatingItems} />
            </div>
            <Toaster />
        </>
    );
}

