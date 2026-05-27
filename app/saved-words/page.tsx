import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SavedWordsClient } from "@/components/saved-words-client";
import { BookOpen } from "lucide-react";
import Header from "@/components/header";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Footer from "@/components/footer";

export default async function SaveWordsPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        redirect("/login");
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
    });

    if (!user) {
        redirect("/login");
    }

    const savedWords = await prisma.savedWord.findMany({
        where: { userId: user.id },
        select: {
            id: true,
            word: true,
            createdAt: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return (
        <>
            <Header />
            <div className="min-h-screen mt-10 mx-auto container max-w-4xl px-4 py-10 fade-in">
                <Card className="rounded-b-none relative overflow-hidden border-none ring-1 ring-border shadow-sm">
                    <div className="absolute inset-0 z-0 opacity-[0.02] dark:opacity-[0.05] pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] [background-size:24px_24px]"></div>
                    <div className="absolute inset-0 z-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none"></div>

                    <CardHeader className="relative z-10">
                        <CardTitle className="flex items-conter gap-3 font-bold">
                            <BookOpen className="h-5 w-5 text-primary" />
                            Your Saved Words
                        </CardTitle>
                        <CardDescription className="text-base">{"Review and study the vocabulary you've collected."}</CardDescription>
                    </CardHeader>
                </Card>
                <SavedWordsClient initialWords={savedWords} />
            </div>
            <Footer />
        </>
    );
}
